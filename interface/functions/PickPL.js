import { DefaultButtonFonctioner } from './default.js';
import { PLpoint, PLLine } from '../classes/elements.js';


class PickPL extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
    }

    onClick() {
        if (!this.interactPhoto.movable)       return;
        
        this.interactPhoto.isPickingPL = !this.interactPhoto.isPickingPL;
        this.interactPhoto.tips.innerHTML = `${this.interactPhoto.isPickingPL ? '单击添加铅垂线端点。' : ''}`;

        if (this.interactPhoto.isPickingPL) {
            this.interactPhoto.buttonFonctioner = this;
        } else {
            this.interactPhoto.resetButtonFonctioner();
        }
    }

    handleMouseUp(e) {
        super.handleMouseUp(e);

        // 选择铅垂线
        if (this.interactPhoto.isPickingPL) {
            if (this.interactPhoto.cancelOp){
                this.interactPhoto.cancelOp = false;
                // 取消操作
            }
            else {
                // 加入
                let p = this.interactPhoto.canvas.getPointer(e.e);
                this.addPLEndpoint(p.x, p.y);              
            }
            this.addPL();
            this.interactPhoto.isPickingPL = false;
            this.interactPhoto.tips.innerHTML = '';
            this.interactPhoto.setCanvasCursor('grab');
        } 
    }

    // 添加铅垂线端点的函数
    addPLEndpoint(x, y) {
        this.interactPhoto.numPLPoint++;
        let plpoint = new PLpoint(x, y, this.interactPhoto.numPLPoint, this.interactPhoto.canvas);
        this.interactPhoto.PLPoints.push([x,y]);
        console.log(this.interactPhoto.PLPoints);
    }

    addPL(){
        if (this.interactPhoto.PLPoints.length==2){
            this.interactPhoto.numPL++;
            this.interactPhoto.PLs.push(this.interactPhoto.PLPoints);
            console.log(this.interactPhoto.PLs);
            let pl = new PLLine(this.interactPhoto.PLPoints.flat(), this.interactPhoto.numPL, this.interactPhoto.canvas);
            this.interactPhoto.globalPLs.push(pl);
            this.interactPhoto.PLPoints=[];
        }
    }
}


export { PickPL };