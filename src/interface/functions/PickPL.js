import { DefaultbuttonFunctioner } from './Default.js';

// 选择铅垂线按钮功能类
class PickPL extends DefaultbuttonFunctioner {
    constructor(interactPhoto) {
        super(interactPhoto);
        this.isPickingPL = false; // 是否正在选择铅垂线
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        this.isPickingPL = !this.isPickingPL;
        this.interactPhoto.tips.innerHTML = `${this.isPickingPL ? '单击添加铅垂线端点。' : ''}`;

        if (this.isPickingPL) {
            this.interactPhoto.buttonFunctioner = this;
        } else {
            this.interactPhoto.resetbuttonFunctioner();
        }
    }

    clearData() {
        this.isPickingPL = false;
        for (let pl of this.interactPhoto.PLArray.array) {
            pl.remove();
        }
        this.interactPhoto.PLArray.array = [];
    }

    handleMouseUp(e) {
        super.handleMouseUp(e);
        if (!this.interactPhoto.movable) return;

        // 选择铅垂线
        if (this.isPickingPL) {
            if (this.interactPhoto.cancelOp) {
                this.interactPhoto.cancelOp = false;
                // 取消操作
            } else {
                // 加入一个端点
                let p = this.interactPhoto.canvas.getPointer(e.e);
                this.addPL([p.x, p.y]);
                // 结束此次操作
                this.isPickingPL = false;
                this.interactPhoto.resetbuttonFunctioner();
                this.interactPhoto.tips.innerHTML = '';
                this.interactPhoto.setCanvasCursor('grab');
            }
        }
    }

    // 添加铅垂线的函数
    addPL(coordinate) {
        this.interactPhoto.PLArray.add(coordinate);
    }
}

export { PickPL };
