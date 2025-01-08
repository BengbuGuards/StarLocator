import { DefaultbuttonFunctioner } from './Default.js';
import { Rectangle } from '../elements/Rectangle.js';
import { post } from '../utils.js';
import { BACKEND_API } from '../../config.js';

const selectStatus = {
    IDLE: 0,
    READY: 1,
    SELECTING: 2,
    CALCING: 3,
};

// 选择天体按钮功能类
class SelectStars extends DefaultbuttonFunctioner {
    constructor(interactPhoto) {
        super(interactPhoto);
        this.status = selectStatus.IDLE; // 框选的状态
        this.rect = null; // 选择天体的矩形框
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        if (this.status === selectStatus.IDLE) {
            this.status = selectStatus.READY;
            this.interactPhoto.tips.innerHTML = '框选要寻星的区域。';
        } else if (this.status === selectStatus.READY) {
            this.status = selectStatus.IDLE;
            this.interactPhoto.tips.innerHTML = '';
        }

        if (this.status === selectStatus.READY) {
            this.interactPhoto.buttonFunctioner = this;
        } else if (this.status === selectStatus.IDLE) {
            this.interactPhoto.resetbuttonFunctioner();
        }
    }

    clearData() {
        this.status = selectStatus.IDLE;
    }

    handleMouseDown(e) {
        super.handleMouseDown(e);
        if (!this.interactPhoto.movable) return;

        if (this.status === selectStatus.READY) {
            // 开始选择，创建矩形框
            this.status = selectStatus.SELECTING;
            this.interactPhoto.setCanvasCursor('crosshair');
            let p = this.interactPhoto.canvas.getPointer(e.e);
            this.rect = new Rectangle(p.x, p.y, this.interactPhoto.canvas);
        }
    }

    handleMouseMove(e) {
        super.handleMouseMove(e);
        if (!this.interactPhoto.movable) return;

        if (this.status === selectStatus.SELECTING) {
            // 更新矩形框
            let p = this.interactPhoto.canvas.getPointer(e.e);
            this.rect.update(p.x, p.y);
        }
    }

    handleMouseUp(e) {
        super.handleMouseUp(e);
        if (!this.interactPhoto.movable) return;

        if (this.status === selectStatus.SELECTING) {
            // 结束选择，获取选择的天体
            let coords = this.rect.getCoordinates();
            this.status = selectStatus.CALCING;
            this.locateStars(this.interactPhoto.img, this.interactPhoto.rect, coords);
            // 结束此次操作
            this.interactPhoto.canvas.remove(this.rect.rect);
            this.rect = null;
            this.status = selectStatus.IDLE;
            this.interactPhoto.tips.innerHTML = '';
            this.interactPhoto.setCanvasCursor('grab');
            this.interactPhoto.buttonFunctioner = this.interactPhoto.defaultbuttonFunctioner;
        }
    }

    // 通过选择的天体区域寻找天体
    locateStars(img, imgRect, coords) {
        // 创建一个临时的canvas用于裁剪
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = coords.width;
        tempCanvas.height = coords.height;
        var ctx = tempCanvas.getContext('2d');

        // 将裁剪区域绘制到临时canvas上
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
        tempCanvas.toBlob((blob) => {
            // 使用FormData准备POST请求的数据
            let formData = { image: blob, thresh: document.getElementById('setStarThresh').value };

            // 发送POST请求
            post(BACKEND_API + '/astrometry/extractstars', formData, 'form').then(([results, detail]) => {
                if (detail == 'success') {
                    // 显示天体
                    this.showStars(coords.left, coords.top, results);
                    this.interactPhoto.tips.innerHTML = `寻星成功：共找到${results.positions.length}颗星`;
                } else {
                    this.interactPhoto.tips.innerHTML = `寻星失败：${detail}`;
                }
            });
        });
    }

    // 显示天体
    showStars(x0, y0, stars) {
        console.log(stars);
        stars.positions.forEach((star) => {
            this.interactPhoto.CeleArray.add(star[0] + x0, star[1] + y0);
        });
    }
}

export { SelectStars };
