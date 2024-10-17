import { DefaultButtonFonctioner } from './default.js';


class PickCele extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
    }

    onClick() {
        if (!this.interactPhoto.movable)       return;
        this.interactPhoto.isPickingCele = !this.interactPhoto.isPickingCele;
        this.interactPhoto.tips.innerHTML = `${this.interactPhoto.isPickingCele ? '单击要选择的天体。' : ''}`;
        if (this.interactPhoto.isPickingCele) {
            this.interactPhoto.buttonFonctioner = this;
        } else {
            this.interactPhoto.buttonFonctioner = this.interactPhoto.defaultButtonFonctioner;
        }
    }

    handleMouseUp(e) {
        super.handleMouseUp(e);

        if (this.interactPhoto.cancelOp) {
            this.interactPhoto.cancelOp = false;
            // 取消操作
        } else {
            // 加入
            let p = this.interactPhoto.canvas.getPointer(e.e);
            this.addStarAtPoint(p.x, p.y);
        }
        this.interactPhoto.isPickingCele = false;
        this.interactPhoto.tips.innerHTML = '';
        this.interactPhoto.setCanvasCursor('grab');

        this.interactPhoto.buttonFonctioner = this.interactPhoto.defaultButtonFonctioner;
    }
}


export { PickCele };