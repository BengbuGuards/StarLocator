// 点基类
class ShapeObject {
    constructor(x, y, id, canvas, color, label) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.canvas = canvas;
        this.color = color;

        this.point = new fabric.Path('M15 0 16 16 17 0ZM0 15 16 16 0 17ZM15 32 16 16 17 32ZM32 17 16 16 32 15Z', {
            left: x - 16.5,
            top: y - 16.5,
            width: 32,
            height: 32,
            fill: this.color,
            hasControls: false
        });

        this.label = new fabric.Text(label, {
            left: x + 16.5,
            top: y - 10.5,
            fontSize: 16,
            fontFamily: 'Segoe WPC,Segoe UI,Microsoft YaHei,sans-serif',
            fill: this.color,
            selectable: false,
            hoverCursor: 'grab'
        });

        this.point.on('moving', this.onMove.bind(this));
        this.canvas.add(this.point);
        this.canvas.add(this.label);
    }

    setRealXY(x, y) {
        this.x = x - 16.5, this.y = y - 16.5;
    }

    getRealXY() {
        return new fabric.Point(this.x + 16.5, this.y + 16.5)
    }

    onMove() {
        this.label.left = this.point.left + 33;
        this.label.top = this.point.top + 6;
        this.label.setCoords();
    }

    onZoom() {

    }

    remove() {
        this.canvas.remove(this.point);
        this.canvas.remove(this.label);
    }
}

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
        console.log(x, y);
        document.getElementById(`coordX${this.id}`).value = x;
        document.getElementById(`coordY${this.id}`).value = y;
    }

    onMove() {
        this.label.left = this.point.left + 32;
        this.label.top = this.point.top + 6;
        this.label.setCoords();

        // 修改表格内容（貌似性能不是很好）
        this.addToTable(
            this.round(this.point.left + 16.5, 2),
            this.round(this.point.top + 16.5, 2)
        )
    }

    /**
     * 当表格内星星名字变动时，在图上重命名
     */
    onRename() {
        // 获取填写的名称
        let name = document.getElementById(`name${this.id}`).innerText;  // this.id 为字符串 name数字
        // 若没填写名字，显示两位数编号
        if (name === '') {
            name = this.id.toString().padStart(2, '0')
        }
        // 必须使用 set() 方法并刷新画布，否则文本更改不会显示
        this.label.set('text', name);
        this.canvas.renderAll();
    }

    /**
     * 当对应的名字的 div 获取焦点时，在图上高亮显示自己
     */
    onNameDivOnFocus() {
        // 将图上对应的点设置为选中
        this.canvas.setActiveObject(this.point);
        this.canvas.renderAll();
    }
}

// 线端点类
class PLpoint extends ShapeObject {
    constructor(coordinate, interactPhoto, id, color) {
        super(coordinate[0], coordinate[1], id, interactPhoto.canvas, color, '');
        this.coordinate = coordinate;
        this.interactPhoto = interactPhoto;
    }

    onMove() {
        super.onMove();
        this.coordinate = [this.point.left + 16.5, this.point.top + 16.5];
    }
}

// 线基类
class LineObject {
    constructor(coordinates, interactPhoto, color) {
        this.coordinates = coordinates;
        this.canvas = interactPhoto.canvas;
        this.id = interactPhoto.numPL;
        this.color = color;

        this.line = new fabric.Line(this.coordinates, {
            fill: this.color,
            stroke: this.color,
            strokeWidth: 1,
            selectable: false,
            hoverCursor: 'grab'
        });

        this.canvas.add(this.line);
    }

    remove() {
        this.canvas.remove(this.line);
    }
}

// 端点线类
class PLLine {
    constructor(interactPhoto) {
        this.interactPhoto = interactPhoto;
        this.points = [];
        this.lineObject = null;
    }

    addPoint(coordinate) {
        let id = this.interactPhoto.numPL * 2 + this.points.length;
        let point = new PLpoint(coordinate, this.interactPhoto, id, '#35dc96');
        this.points.push(point);

        if (this.points.length == 2) {
            let lineCoord = [
                this.points[0].coordinate,
                this.points[1].coordinate
            ].flat();
            this.lineObject = new LineObject(lineCoord, this.interactPhoto, '#35dc96');
            this.addMoveLineEvent();
            this.interactPhoto.numPL++;
        } else if (this.points.length > 2) {
            console.error('Too many points in a line.');
        }
    }

    addMoveLineEvent() {
        this.points[0].point.off('moving');
        this.points[1].point.off('moving');
        this.points[0].point.on('moving', this.onMovePoint.bind(this, this.points[0]));
        this.points[1].point.on('moving', this.onMovePoint.bind(this, this.points[1]));
    }

    onMovePoint(PLpoint) {
        PLpoint.onMove();
        // TODO: 在这里执行点的更新工作
        let line = this.lineObject.line;
        line.set({
            x1: this.points[0].coordinate[0],
            y1: this.points[0].coordinate[1],
            x2: this.points[1].coordinate[0],
            y2: this.points[1].coordinate[1]
        });
        line.setCoords();  // 更新线的位置
        this.interactPhoto.canvas.renderAll();  // 刷新画布以显示更改
    }

    remove() {
        this.points.forEach(point => point.remove());
        if (this.lineObject != null) {
            this.lineObject.remove();
        }
    }
}

export {CelestialBody, PLpoint, PLLine};