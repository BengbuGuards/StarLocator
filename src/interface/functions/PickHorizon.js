import { DefaultbuttonFunctioner } from './Default.js';

// 选择地平线按钮功能类
class PickHorizon extends DefaultbuttonFunctioner {
    constructor(interactPhoto) {
        super(interactPhoto);
        this.isPickingHL = false; // 是否正在选择地平线
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        this.isPickingHL = !this.isPickingHL;
        this.interactPhoto.tips.innerHTML = `${this.isPickingHL ? '单击添加地平线端点。' : ''}`;

        if (this.isPickingHL) {
            this.interactPhoto.buttonFunctioner = this;
        } else {
            this.interactPhoto.resetbuttonFunctioner();
        }
    }

    clearData() {
        this.isPickingHL = false;
        for (let hl of this.interactPhoto.HLArray.array) {
            hl.remove();
        }
        this.interactPhoto.HLArray.array = [];
        this.interactPhoto.updateCalculButton();
    }

    handleMouseUp(e) {
        super.handleMouseUp(e);
        if (!this.interactPhoto.movable) return;

        // 选择地平线
        if (this.isPickingHL) {
            if (this.interactPhoto.cancelOp) {
                this.interactPhoto.cancelOp = false;
                // 取消操作
            } else {
                // 加入一个端点
                let p = this.interactPhoto.canvas.getPointer(e.e);
                this.addHL([p.x, p.y]);
                // 结束此次操作
                this.isPickingHL = false;
                this.interactPhoto.resetbuttonFunctioner();
                this.interactPhoto.tips.innerHTML = '';
                this.interactPhoto.setCanvasCursor('grab');
            }
        }
    }

    // 添加地平线的函数
    addHL(coordinate) {
        this.interactPhoto.HLArray.add(coordinate);
    }
}

export { PickHorizon };
