import { DefaultButtonFonctioner } from './default.js';
import { PLpoint, PLLine } from '../classes/elements.js';


// 选择铅垂线按钮功能类
class PickPL extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
        this.isPickingPL = false;   // 是否正在选择铅垂线
        this.alonePLPoint = null;   // 临时的单个铅垂线端点
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
                this.addPLEndpoint(p.x, p.y);
                this.addPL();
                this.isPickingPL = false;
                this.interactPhoto.resetButtonFonctioner();
                this.interactPhoto.tips.innerHTML = '';
                this.interactPhoto.setCanvasCursor('grab');
            }
        } 
    }

    // 添加铅垂线端点的函数
    addPLEndpoint(x, y) {
        this.interactPhoto.numPLPoint++;
        if (this.interactPhoto.PLPointsCoord.length==0) {
            this.alonePLPoint = new PLpoint([x, y], this.interactPhoto, this.interactPhoto.numPLPoint, '#35dc96');
        }
        this.interactPhoto.PLPointsCoord.push([x,y]);
        console.log(this.interactPhoto.PLPointsCoord);
    }

    // 添加铅垂线的函数
    addPL(){
        if (this.interactPhoto.PLPointsCoord.length==2){
            this.alonePLPoint.remove();
            this.alonePLPoint = null;
            this.interactPhoto.numPL++;
            this.interactPhoto.globalPLPointsCoord.push(this.interactPhoto.PLPointsCoord);
            console.log(this.interactPhoto.globalPLPointsCoord);
            let pl = new PLLine(this.interactPhoto.PLPointsCoord.flat(), this.interactPhoto);
            this.interactPhoto.globalPLs.push(pl);
            this.interactPhoto.PLPointsCoord=[];
        }
    }
}


export { PickPL };