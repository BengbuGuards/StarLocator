import { DefaultbuttonFunctioner } from './Default.js';

// 选择天体按钮功能类
class PickCele extends DefaultbuttonFunctioner{
    constructor(interactPhoto){
        super(interactPhoto);
        this.isPickingCele = false; // 是否正在选择天体
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;
        
        this.isPickingCele = !this.isPickingCele;
        this.interactPhoto.tips.innerHTML = `${this.isPickingCele ? '单击要选择的天体。' : ''}`;
        
        if (this.isPickingCele) {
            this.interactPhoto.buttonFunctioner = this;
        } else {
            this.interactPhoto.resetbuttonFunctioner();
        }
    }

    clearData() {
        this.isPickingCele = false;
        this.interactPhoto.CeleArray.clear();
    }

    handleMouseUp(e) {
        super.handleMouseUp(e);
        if (!this.interactPhoto.movable) return;

        if (this.interactPhoto.cancelOp) {
            this.interactPhoto.cancelOp = false;
            // 取消操作
        } else {
            // 加入
            let p = this.interactPhoto.canvas.getPointer(e.e);
            this.addStarAtPoint(p.x, p.y);
        }
        this.isPickingCele = false;
        this.interactPhoto.tips.innerHTML = '';
        this.interactPhoto.setCanvasCursor('grab');

        this.interactPhoto.buttonFunctioner = this.interactPhoto.defaultbuttonFunctioner;
    }

    // 添加星星点的函数
    addStarAtPoint(x, y) {
        // 保留两位小数
        x = Math.round(x * 100) / 100;
        y = Math.round(y * 100) / 100;

        this.interactPhoto.CeleArray.add(x, y);
    }
}

export { PickCele };