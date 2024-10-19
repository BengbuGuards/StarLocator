import { DefaultButtonFonctioner } from './Default.js';
import { PLpoint, PLLine } from '../classes/elements.js';


// 选择铅垂线按钮功能类
class PickPL extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
        this.isPickingPL = false;   // 是否正在选择铅垂线
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;
        
        this.isPickingPL = !this.isPickingPL;
        this.interactPhoto.tips.innerHTML = `${this.isPickingPL ? '单击添加铅垂线端点。' : ''}`;

        if (this.isPickingPL) {
            this.interactPhoto.buttonFonctioner = this;
        } else {
            this.interactPhoto.resetButtonFonctioner();
        }
    }

    handleMouseUp(e) {
        super.handleMouseUp(e);
        if (!this.interactPhoto.movable) return;

        // 选择铅垂线
        if (this.isPickingPL) {
            if (this.interactPhoto.cancelOp){
                this.interactPhoto.cancelOp = false;
                // 取消操作
            }
            else {
                // 加入
                let p = this.interactPhoto.canvas.getPointer(e.e);
                this.addPL([p.x, p.y]);
                this.isPickingPL = false;
                this.interactPhoto.resetButtonFonctioner();
                this.interactPhoto.tips.innerHTML = '';
                this.interactPhoto.setCanvasCursor('grab');
            }
        } 
    }

    // 添加铅垂线的函数
    addPL(coordinate){
        if (this.interactPhoto.globalPLs.length == 0 || this.interactPhoto.globalPLs.slice(-1)[0].points.length == 2){
            let pl = new PLLine(this.interactPhoto);
            this.interactPhoto.globalPLs.push(pl);
        }
        this.interactPhoto.globalPLs.slice(-1)[0].addPoint(coordinate);
    }
}


export { PickPL };