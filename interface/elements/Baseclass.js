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
        this.x = x, this.y = y;
		this.point.left = x - 16.5, this.point.top = y - 16.5;
		this.onMove();
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

// 数据结构基类
class markerArray{
    constructor(){
        this.array=[];
        this.num=0;
    }

    add(obj){
        this.array.push(obj);
        this.num++;
    }

    remove(id){
        this.array[id].remove();
        this.array.splice(id, 1);
        this.num--;
    }

    get(id){
        return this.array[id];
    }

    clear(){
        for(let i of this.array){
            i.remove();
        }
        this.array=[];
        this.num=0;
    }
}

export { ShapeObject, LineObject , markerArray};