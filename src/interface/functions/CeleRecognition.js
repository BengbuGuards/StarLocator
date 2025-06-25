import { DefaultbuttonFunctioner } from './Default.js';
import { post } from '../utils.js';
import { BACKEND_API } from '../../config.js';

const recognitionStatus = {
    READY: 0, // 按钮未激活
    SUBMITTING: 1, // 准备提交数据并申请排队
    SOLVING: 2, // 等待Astrometry求解
    RECOGNIZING: 3, // 等待后端解析星名
};

// 天体识别按钮功能类
class RecognizeStars extends DefaultbuttonFunctioner {
    constructor(interactPhoto) {
        super(interactPhoto);
        this.status = recognitionStatus.SUBMITTING; // 识别的状态
        this.xy = null; // 所有天体的图上坐标
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        if (this.status === recognitionStatus.READY) {
            // 检查数据
            if (this.interactPhoto.CeleArray.num() < 3) {
                this.interactPhoto.tips.innerHTML = '请至少选择三颗星';
                return;
            }

            this.buttonFunStore.changeButtonFun('RecognizeStars');
            this.status === recognitionStatus.SUBMITTING;
        } else {
            // 自动识星可能比较耗时，可以让用户取消
            this.clearData();
            this.interactPhoto.resetbuttonFunctioner();
            this.interactPhoto.tips.innerHTML = '已取消自动识星';
        }

        if (this.status === recognitionStatus.SUBMITTING) {
            this.submitData();
        }
    }

    clearData() {
        this.status = recognitionStatus.SUBMITTING;
        this.xy = null;
    }

    // 提交数据
    async submitData() {
        this.interactPhoto.tips.innerHTML = '正在申请任务排队（0/3）';
        this.xy = this.getXY();
        const subImages = await this.getSubImages(this.xy);
        const image_width = this.interactPhoto.img.width;
        const image_height = this.interactPhoto.img.height;
        const formData = {
            sub_images: subImages,
            xy: JSON.stringify(this.xy),
            image_width: image_width,
            image_height: image_height,
            scale_lower: document.getElementById('setScopeAngle1').value,
            scale_upper: document.getElementById('setScopeAngle2').value,
        };
        post(BACKEND_API + '/astrometry/submit', formData, 'form').then(([results, detail]) => {
            if (detail == 'success') {
                this.interactPhoto.tips.innerHTML = '正在求解天体坐标（1/3）';
                this.inquire(results['job_id']);
            } else {
                this.interactPhoto.tips.innerHTML = `提交数据失败：${detail}`;
                this.clearData(); // TODO：其他按钮功能类可能也需要清除状态
                this.interactPhoto.resetbuttonFunctioner();
            }
        });
    }

    // 轮询Astrometry任务是否成功
    inquire(jobid) {
        fetch(`${BACKEND_API}/astrometry/jobidstatus/${jobid}`, {
            method: 'GET',
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data['status'] === 'success') {
                    this.interactPhoto.tips.innerHTML = '正在识别天体名称（2/3）';
                    this.recognizeStars(jobid);
                } else if (data['status'] === 'failure') {
                    this.interactPhoto.tips.innerHTML = '无法确定天体坐标';
                    this.clearData();
                    this.interactPhoto.resetbuttonFunctioner();
                } else {
                    setTimeout(() => {
                        this.inquire(jobid);
                    }, 1000);
                }
            })
            .catch((error) => {
                this.interactPhoto.tips.innerHTML = `查询任务状态失败：${error}`;
                this.clearData();
                this.interactPhoto.resetbuttonFunctioner();
            });
    }

    // 识别星名
    recognizeStars(jobid) {
        const data = {
            job_id: jobid,
            xy: this.xy,
            timestamp: this.interactPhoto.getTimestamp(),
            is_zh: true,
        };
        post(BACKEND_API + '/astrometry/recognize', data, 'json').then(([results, detail]) => {
            if (detail == 'success') {
                this.interactPhoto.tips.innerHTML = '识别成功（3/3）';
                this.showStars(results);
            } else {
                this.interactPhoto.tips.innerHTML = `识别失败：${detail}`;
            }
            this.clearData();
            this.interactPhoto.resetbuttonFunctioner();
        });
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
            this.interactPhoto.CeleArray[star_id].hAngle = 360 - hd_names[i][0] * 15;
            this.interactPhoto.CeleArray[star_id].declin = hd_names[i][1];
            document.getElementById(`name${star_id}`).value = hd_names[i][2];
            // 手动触发输入事件，以便更新图上文字
            document.getElementById(`name${star_id}`).dispatchEvent(new Event('input'));
        }
    }
}

export { RecognizeStars };
