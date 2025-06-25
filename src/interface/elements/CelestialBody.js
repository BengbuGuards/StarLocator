import { ShapeObject, markerArray } from './Baseclass.js';
import { autoCompleteStarName } from '../functions/AutoComplete.js';

// 星体类
class CelestialBody extends ShapeObject {
    constructor(x, y, id, canvas) {
        super(x, y, id, canvas, '#FFD248', `${id}`);
        // 初始化图上名字
        this.onRename();
        // 初始化图上坐标
        this.addToTable();
        // 绑定事件
        this.bindEvents();
        this.name = this.id.toString().padStart(2, '0');
        this.hAngle = NaN;
        this.declin = NaN;
    }

    /**
     * 绑定与该星星相关的事件
     */
    bindEvents() {
        // 绑定名字 div 文本变化事件
        let nameDiv = document.getElementById(`name${this.id}`);
        nameDiv.oninput = this.onRename.bind(this); // 一定要指定 this！！！
        // 绑定名字 div 获取焦点
        nameDiv.onfocus = this.onNameDivOnFocus.bind(this);
        // 绑定坐标值变动事件
        let coordX = document.getElementById(`coordX${this.id}`);
        let coordY = document.getElementById(`coordY${this.id}`);
        coordX.oninput = this.onValueChange.bind(this);
        coordY.oninput = this.onValueChange.bind(this);
    }

    /**
     * 四舍五入到指定位数
     * @param num {number} 原始数据
     * @param digits {number} 小数点后的位数
     * @returns {number} 四舍五入后的结果
     */
    round(num, digits = 0) {
        let tmp = 10 ** digits;
        return Math.round(num * tmp) / tmp;
    }

    addToTable(x = this.x, y = this.y) {
        document.getElementById(`coordX${this.id}`).value = x;
        document.getElementById(`coordY${this.id}`).value = y;
    }

    onMove() {
        super.onMove();

        // 修改表格内容（貌似性能不是很好）
        this.addToTable(this.round(this.point.left + 16.5, 2), this.round(this.point.top + 16.5, 2));
    }

    /**
     * 当对应的名字的 div 获取焦点时，在图上高亮显示自己
     */
    onNameDivOnFocus() {
        // 将图上对应的点设置为选中
        this.canvas.setActiveObject(this.point);
        this.canvas.renderAll();
    }

    /**
     * 当表格内星星名字变动时，在图上重命名
     */
    onRename() {
        // 获取填写的名称
        let name = document.getElementById(`name${this.id}`).value; // this.id 为字符串 name数字
        // 若没填写名字，显示两位数编号
        if (name === '' || name === '\n') {
            name = this.id.toString().padStart(2, '0');
        }
        // 必须使用 set() 方法并刷新画布，否则文本更改不会显示
        this.label.set('text', name);
        this.canvas.renderAll();
    }

    /**
     * 当坐标值变动时，更新图上的点
     */
    onValueChange() {
        let x = parseFloat(document.getElementById(`coordX${this.id}`).value);
        let y = parseFloat(document.getElementById(`coordY${this.id}`).value);
        this.setRealXY(x, y);
        this.point.setCoords();
        this.label.setCoords();
        this.canvas.renderAll();
    }

    remove() {
        super.remove();
    }
}

class CeleArray extends markerArray {
    constructor(interactPhoto) {
        super(interactPhoto);
    }

    add(x, y) {
        // 创建新的星星对象
        let star = new CelestialBody(x, y, this.num(), this.interactPhoto.canvas);
        this.array.push(star);
        // 为新添加的星星绑定与CeleArray相关的删除事件
        star.deleter
            .on('mousedown', () => {
                this.remove(star.id);
            })
            .bind(this);
        // 为新添加的星星绑定补全星星名字事件
        autoCompleteStarName(document.getElementById(`name${this.num() + 1}`));
    }

    /**
     * 从数组中删除指定id（从1开始计）的星星
     * 注：不处理星星标记本身的删除逻辑
     * @param {Number} id
     */
    remove(id) {
        // 对后面的星星进行 id 更新
        for (let celeBody of this.array) {
            if (celeBody.id > id) {
                celeBody.id--;
                celeBody.onRename();  // TODO：可能不需要？
                celeBody.bindEvents();
            }
        }
        // 最后从数组中删除对应星星
        this.array.splice(id - 1, 1);
    }

    clear() {
        // 清空星星及其数组
        for (let i of this.array) {
            i.remove();
        }
        this.array = [];
    }
}

export { CelestialBody, CeleArray };
