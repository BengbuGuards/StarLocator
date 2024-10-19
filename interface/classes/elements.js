// 点基类
class ShapeObject {
    constructor(x, y, id, canvas, Color, label) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.canvas = canvas;
        this.Color = Color;

        this.point = new fabric.Path('M15 0 16 16 17 0ZM0 15 16 16 0 17ZM15 32 16 16 17 32ZM32 17 16 16 32 15Z', {
            left: x - 16.5,
            top: y - 16.5,
            width: 32,
            height: 32,
            fill: this.Color,
            hasControls: false,
            id: this.id
        });

        this.label = new fabric.Text(label, {
            left: x + 16.5,
            top: y - 10.5,
            fontSize: 16,
            fontFamily: '微软雅黑',
            fill: this.Color,
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

// 铅垂线端点类
class PLpoint extends ShapeObject {
    constructor(x, y, interactPhoto) {
        super(x, y, interactPhoto.numPLPoint, interactPhoto.canvas, '#35dc96', '');
        this.coordinate=[x,y];
        this.interactPhoto = interactPhoto;
    }

    onMove() {
        super.onMove();
        this.interactPhoto.movingPLPointID = this.id;

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

    onMouseUp() {
        this.interactPhoto.movingPLPointID = 0;
    }
}

// 线基类
class LineObject {
    constructor(coordinates, id, canvas, Color) {
        this.coordinates = coordinates;
        this.canvas = canvas;
        this.Color = Color;
        this.id = id;

        this.line = new fabric.Line(this.coordinates, {
            fill: this.Color,
            stroke: this.Color,
            strokeWidth: 1,
            selectable: false,
            hoverCursor: 'grab'
        });

        this.canvas.add(this.line);
    }
}

// 端点线类
class PLLine extends LineObject {
    constructor(coordinates, id, canvas) {
        super(coordinates, id, canvas, '#35dc96');
    }
}

export { CelestialBody, PLpoint, PLLine };