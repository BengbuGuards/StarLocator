import { DefaultButtonFonctioner } from './default.js';
import { CelestialBody } from '../classes/elements.js';


class PickCele extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
        this.isPickingCele = false; // 是否正在选择天体
    }

    onClick() {
        super.onClick();
        
        this.isPickingCele = !this.isPickingCele;
        this.interactPhoto.tips.innerHTML = `${this.isPickingCele ? '单击要选择的天体。' : ''}`;
        
        if (this.isPickingCele) {
            this.interactPhoto.buttonFonctioner = this;
        } else {
            this.interactPhoto.resetButtonFonctioner();
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
        this.isPickingCele = false;
        this.interactPhoto.tips.innerHTML = '';
        this.interactPhoto.setCanvasCursor('grab');

        this.interactPhoto.buttonFonctioner = this.interactPhoto.defaultButtonFonctioner;
    }

    // 添加星星点的函数
    addStarAtPoint(x, y) {
        // 保留两位小数
        x = Math.round(x * 100) / 100;
        y = Math.round(y * 100) / 100;
        this.interactPhoto.numOfPts++;

        // 判断星星数量是否已超过表格行数
        let inputTable = document.getElementById('inputTable');
        if (this.interactPhoto.numOfPts > inputTable.rows.length - 2) {	// 减掉一行标题与一行天顶
            // 添加一行
            let newRow = inputTable.insertRow(this.interactPhoto.numOfPts + 1);
            // 添加单元格
            let secondStarRow = inputTable.rows[3];
            // 第二颗星星的行，用于 HTML 模板
            // 为什么不用第一行：style="flex: 1" 出现在属性里，这不应被替换
            for (let i = 0; i <= 5; ++i) {
                newRow.insertCell(i).innerHTML	// 将第二行 HTML 抄过来并替换数字
                    = secondStarRow.cells[i].innerHTML.replace('2', `${this.interactPhoto.numOfPts}`);
            }
        }

        let star = new CelestialBody(x, y, this.interactPhoto.numOfPts, this.interactPhoto.canvas);
        star.addToTable();
        this.interactPhoto.points.push(star.point);
        this.interactPhoto.ptLabels.push(star.label);
    }
}


export { PickCele };