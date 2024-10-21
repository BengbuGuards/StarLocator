import {ShapeObject, LineObject} from './Baseclass.js';

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

export {PLpoint, PLLine};