import { DefaultbuttonFunctioner } from './Default.js';
import { post, setHADE } from '../utils.js';
import { BACKEND_API } from '../../config.js';

// 天体识别按钮功能类
class RecognizeStars extends DefaultbuttonFunctioner {
    constructor(interactPhoto) {
        super(interactPhoto);
        this.isRecognizing = false; // 是否正在自动识星
        this.xy = null; // 所有天体的图上坐标
        this.abortController = null; // 用于取消请求
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        if (this.isRecognizing) {
            // 自动识星可能比较耗时，可以让用户取消
            if (this.abortController) {
                this.abortController.abort();
            }
            this.clearData();
            this.interactPhoto.resetbuttonFunctioner();
            this.interactPhoto.tips.innerHTML = '已取消自动识星';
            return;
        }

        // 检查数据
        const count = this.interactPhoto.CeleArray.num();
        if (count < 3) {
            this.interactPhoto.tips.innerHTML = `请至少选择三颗星，当前已标记 ${count} 个`;
            return;
        }

        this.interactPhoto.buttonFunctioner = this;
        this.isRecognizing = true;
        this.submitData();
    }

    clearData() {
        this.isRecognizing = false;
        this.xy = null;
        this.abortController = null;
    }

    // 提交数据并建立SSE连接监听进度
    async submitData() {
        this.interactPhoto.tips.innerHTML = '正在申请任务排队（0/3）';
        this.xy = this.getXY();
        const subImages = await this.getSubImages(this.xy);

        const formData = new FormData();
        subImages.forEach((blob) => formData.append('sub_images', blob, `sub.png`));
        formData.append('xy', JSON.stringify(this.xy));
        formData.append('image_width', this.interactPhoto.img.width);
        formData.append('image_height', this.interactPhoto.img.height);
        formData.append('scale_lower', document.getElementById('setScopeAngle1').value);
        formData.append('scale_upper', document.getElementById('setScopeAngle2').value);
        formData.append('timestamp', this.interactPhoto.getTimestamp());
        formData.append('is_zh', true);

        this.abortController = new AbortController();

        try {
            const response = await fetch(`${BACKEND_API}/astrometry/recognize-stream`, {
                method: 'POST',
                body: formData,
                signal: this.abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let lines = buffer.split('\n');
                // 保留最后不完整的一行
                buffer = lines.pop();

                for (let line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.step === 'submitted') {
                                this.interactPhoto.tips.innerHTML = '正在求解天体坐标（1/3）';
                            } else if (data.step === 'solving') {
                                this.interactPhoto.tips.innerHTML = '正在识别天体名称（2/3）';
                            } else if (data.step === 'success') {
                                this.interactPhoto.tips.innerHTML = '识别成功（3/3）';
                                this.showStars(data);
                                this.clearData();
                                this.interactPhoto.resetbuttonFunctioner();
                            } else if (data.step === 'error') {
                                this.interactPhoto.tips.innerHTML = `识别失败：${data.detail}`;
                                this.clearData();
                                this.interactPhoto.resetbuttonFunctioner();
                                return; // 发生错误，结束处理
                            }
                        } catch (e) {
                            console.error('SSE Parsing error:', e, dataStr);
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('自动识星请求已被取消');
            } else {
                this.interactPhoto.tips.innerHTML = `提交请求失败：${error.message}`;
                this.clearData();
                this.interactPhoto.resetbuttonFunctioner();
            }
        }
    }

    // 获取天体的图上坐标
    getXY() {
        let xy = [];
        let width = this.interactPhoto.rect.width;
        let height = this.interactPhoto.rect.height;
        for (const star of this.interactPhoto.CeleArray.array) {
            xy.push([star.x + width / 2, star.y + height / 2]);
        }
        return xy;
    }

    // 获取天体的子图
    getSubImages(xy) {
        const img = this.interactPhoto.img;
        const imgRect = this.interactPhoto.rect;
        const size = 20; // 子图的大小

        function getSubImage(x, y) {
            // 创建一个临时的canvas用于裁剪
            let tempCanvas = document.createElement('canvas');
            tempCanvas.width = size;
            tempCanvas.height = size;
            let ctx = tempCanvas.getContext('2d');
            // 将裁剪区域绘制到临时canvas上
            const coords = {
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
            };
            ctx.drawImage(
                img, // 图像元素
                coords.left - imgRect.left,
                coords.top - imgRect.top,
                coords.width,
                coords.height,
                0,
                0,
                coords.width,
                coords.height
            );
            // 将临时canvas转换为Blob对象
            return new Promise((resolve) => {
                tempCanvas.toBlob((blob) => {
                    resolve(blob);
                });
            });
        }

        let subImagesPromises = [];
        for (const [x, y] of xy) {
            subImagesPromises.push(getSubImage(x, y));
        }
        return Promise.all(subImagesPromises);
    }

    // 显示识别结果
    showStars(results) {
        const hd_names = results['hd_names'];
        for (let i = 0; i < this.interactPhoto.CeleArray.num(); i++) {
            const star_id = this.interactPhoto.CeleArray.array[i].id;
            setHADE(star_id, 360 - hd_names[i][0] * 15, hd_names[i][1]);
            document.getElementById(`name${star_id}`).value = hd_names[i][2];
            // 手动触发输入事件，以便更新图上文字
            document.getElementById(`name${star_id}`).dispatchEvent(new Event('input'));
        }
    }
}

export { RecognizeStars };
