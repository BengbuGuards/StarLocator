import { ShapeObject, markerArray } from './Baseclass.js';

// 星体类
class CelestialBody extends ShapeObject {
    constructor(x, y, id, canvas) {
        super(x, y, id, canvas, '#FFD248', `${id}`);
        this.bindEvents()
    }

    /**
     * 绑定与该星星相关的事件
     */
    bindEvents() {
        // 绑定名字 div 文本变化事件
        let nameDiv = document.getElementById(`name${this.id}`);
        nameDiv.oninput = this.onRename.bind(this); // 一定要指定 this！！！
        // 初始化图上名字
        this.onRename();
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
        this.addToTable(
            this.round(this.point.left + 16.5, 2),
            this.round(this.point.top + 16.5, 2)
        )
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
        let name = document.getElementById(`name${this.id}`).innerText;  // this.id 为字符串 name数字
        // 若没填写名字，显示两位数编号
        if (name === '' || name === '\n') {
            name = this.id.toString().padStart(2, '0')
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
        this.canvas.remove(this.point);
        this.canvas.remove(this.label);
        this.canvas.remove(this.deleter);
    }

    removeTableData() {
        document.getElementById(`name${this.id}`).textContent = '';
        document.getElementById(`hAngleH${this.id}`).textContent = '';
        document.getElementById(`hAngleM${this.id}`).textContent = '';
        document.getElementById(`hAngleS${this.id}`).textContent = '';
        document.getElementById(`declinD${this.id}`).textContent = '';
        document.getElementById(`declinM${this.id}`).textContent = '';
        document.getElementById(`declinS${this.id}`).textContent = '';
        document.getElementById(`coordX${this.id}`).value = '';
        document.getElementById(`coordY${this.id}`).value = '';
    }
}

class CeleArray extends markerArray {
    constructor() {
        super();
    }

    add (obj) {
        super.add(obj);
        // 为新添加的星星绑定与CeleArray相关的删除事件
        obj.deleter.on('mousedown', () => {
            this.remove(obj.id);
        }).bind(this);
    }

    /**
     * 从数组中删除指定id（从1开始计）的星星
     * 注：不处理星星标记本身的删除逻辑
     * @param {Number} id 
     */
    remove(id){
        // 先清楚表格数据
        this.array[id - 1].removeTableData();
        // 对后面的星星进行 id 更新
        for(let celeBody of this.array){
            if(celeBody.id > id) {
                document.getElementById(`name${celeBody.id-1}`).textContent = document.getElementById(`name${celeBody.id}`).textContent;
                document.getElementById(`hAngleH${celeBody.id-1}`).textContent = document.getElementById(`hAngleH${celeBody.id}`).textContent;
                document.getElementById(`hAngleM${celeBody.id-1}`).textContent = document.getElementById(`hAngleM${celeBody.id}`).textContent;
                document.getElementById(`hAngleS${celeBody.id-1}`).textContent = document.getElementById(`hAngleS${celeBody.id}`).textContent;
                document.getElementById(`declinD${celeBody.id-1}`).textContent = document.getElementById(`declinD${celeBody.id}`).textContent;
                document.getElementById(`declinM${celeBody.id-1}`).textContent = document.getElementById(`declinM${celeBody.id}`).textContent;
                document.getElementById(`declinS${celeBody.id-1}`).textContent = document.getElementById(`declinS${celeBody.id}`).textContent;
                document.getElementById(`coordX${celeBody.id-1}`).value = document.getElementById(`coordX${celeBody.id}`).value;
                document.getElementById(`coordY${celeBody.id-1}`).value = document.getElementById(`coordY${celeBody.id}`).value;
                celeBody.removeTableData();
                celeBody.id--;
                celeBody.onRename();
            }
        }
        // 最后从数组中删除对应星星
        this.array.splice(id - 1, 1);
    }

    clear() {
        for (let i = 1;i <= this.num(); i++) {
            document.getElementById(`coordX${i}`).value = '';
            document.getElementById(`coordY${i}`).value = '';
        }
        for(let i of this.array){
            i.remove();
        }
        this.array=[];
    }
}

export { CelestialBody , CeleArray};