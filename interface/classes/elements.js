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
            fontFamily: '微软雅黑',
            fill: this.color,
            selectable: false,
            hoverCursor: 'grab'
        });

        this.point.on('moving', this.onMove.bind(this));
        this.canvas.add(this.point);
        this.canvas.add(this.label);
    }

    onMove() {
        this.label.left = this.point.left + 33;
        this.label.top = this.point.top + 6;
        this.label.setCoords();
    }

    remove() {
        this.canvas.remove(this.point);
        this.canvas.remove(this.label);
    }
}

// 星体类
class CelestialBody extends ShapeObject {
    constructor(x, y, id, canvas) {
        super(x, y, id, canvas, '#FFD248', 'xxx');
    }

    addToTable() {
        document.getElementById(`coordX${this.id}`).value = this.x;
        document.getElementById(`coordY${this.id}`).value = this.y;
    }

	onMove() {
        this.label.left = this.point.left + 32;
        this.label.top = this.point.top + 6;
        this.label.setCoords();

 		// 修改表格内容（貌似性能不是很好）
		document.getElementById(`coordX${this.id}`).value = Math.round((this.point.left + 16.5) * 100) / 100;
 		document.getElementById(`coordY${this.id}`).value = Math.round((this.point.top + 16.5) * 100) / 100;
    }
}

// 线端点类
class PLpoint extends ShapeObject {
    constructor(coordinates, interactPhoto, id, color) {
        super(coordinates[0], coordinates[1], id, interactPhoto.canvas, color, '');
        this.coordinate = coordinates;
        this.interactPhoto = interactPhoto;
    }

    onMove() {
        super.onMove();

        if(this.interactPhoto.numPLPoint%2==0){
            this.interactPhoto.globalPLPointsCoord[Math.ceil(this.id/2)-1][this.id % 2 == 0 ? 1 : 0][0]=this.point.left+16.5;
            this.interactPhoto.globalPLPointsCoord[Math.ceil(this.id/2)-1][this.id % 2 == 0 ? 1 : 0][1]=this.point.top+16.5;
            // console.log(this.interactPhoto.globalPLPointsCoord[Math.ceil(this.id/2)-1][this.id % 2 == 0 ? 1 : 0]);
        }
        else{
            this.interactPhoto.PLPointsCoord[0]=this.point.left+16.5;
            this.interactPhoto.PLPointsCoord[1]=this.point.top+16.5;
            this.interactPhoto.PLPointsCoord=[this.interactPhoto.PLPointsCoord];
            // console.log(this.interactPhoto.PLPointsCoord);
        }
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
}

// 端点线类
class PLLine {
    constructor(coordinates, interactPhoto) {
        this.interactPhoto = interactPhoto;
        this.lineObject = new LineObject(coordinates, interactPhoto, '#35dc96');
        this.point1 = new PLpoint(coordinates.slice(0, 2), interactPhoto, interactPhoto.numPLPoint - 1, '#35dc96');
        this.point2 = new PLpoint(coordinates.slice(2, 4), interactPhoto, interactPhoto.numPLPoint, '#35dc96');

        this.point1.point.off('moving');
        this.point2.point.off('moving');

        this.point1.point.on('moving', this.onMovePoint.bind(this, this.point1));
        this.point2.point.on('moving', this.onMovePoint.bind(this, this.point2));
    }

    onMovePoint(PLpoint) {
        PLpoint.onMove();
        let line = this.lineObject.line;
        line.set({
            x1: this.interactPhoto.globalPLPointsCoord[Math.ceil(PLpoint.id / 2 - 1)][0][0],
            y1: this.interactPhoto.globalPLPointsCoord[Math.ceil(PLpoint.id / 2 - 1)][0][1],
            x2: this.interactPhoto.globalPLPointsCoord[Math.ceil(PLpoint.id / 2 - 1)][1][0],
            y2: this.interactPhoto.globalPLPointsCoord[Math.ceil(PLpoint.id / 2 - 1)][1][1]
        });
        line.setCoords();  // 更新线的位置
        this.interactPhoto.canvas.renderAll();  // 刷新画布以显示更改
    }
}

export { CelestialBody, PLpoint, PLLine };