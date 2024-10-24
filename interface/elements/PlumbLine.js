import {ShapeObject, LineObject, markerArray} from './Baseclass.js';

// 线端点类
class PLpoint extends ShapeObject {
    constructor(coordinate, interactPhoto,canvas, id, color) {
        super(coordinate[0], coordinate[1], id, canvas, color, '');
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

    // addPoint(coordinate) {
    //     let id = this.interactPhoto.PLArray.num() * 2 + this.points.length;
    //     let point = new PLpoint(coordinate, this.interactPhoto, id, '#35dc96');
    //     this.points.push(point);

    //     if (this.points.length == 2) {
    //         let lineCoord = [
    //             this.points[0].coordinate,
    //             this.points[1].coordinate
    //         ].flat();
    //         this.lineObject = new LineObject(lineCoord, this.interactPhoto, '#35dc96');
    //         this.addMoveLineEvent();
    //     } else if (this.points.length > 2) {
    //         console.error('Too many points in a line.');
    //     }
    // }

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

class PLArray extends markerArray{
    constructor(interactPhoto){
        super(interactPhoto);
    }
    
    add(coordinate){
        if (this.array.length == 0 || this.array.slice(-1)[0].points.length == 2){
            let pl = new PLLine(this.interactPhoto);
            this.array.push(pl);
        }
        
        let id = this.num() * 2 + this.array.slice(-1)[0].points.length-2;
        let point = new PLpoint(coordinate, this.interactPhoto,this.interactPhoto.canvas, id, '#35dc96');
        this.array.slice(-1)[0].points.push(point);

        if (this.array.slice(-1)[0].points.length == 2) {
            let lineCoord = [
                this.array.slice(-1)[0].points[0].coordinate,
                this.array.slice(-1)[0].points[1].coordinate
            ].flat();
            this.array.slice(-1)[0].lineObject = new LineObject(lineCoord, this.interactPhoto.canvas, '#35dc96');
            this.array.slice(-1)[0].addMoveLineEvent();
        } else if (this.array.slice(-1)[0].points.length > 2) {
            console.error('Too many points in a line.');
        }

        point.deleter.on('mousedown', () => {
            this.remove(point.id);
        }).bind(this);
    }

    remove(id) {
        let deletedId = Math.floor(id);
        if(this.array.slice(-1)[0].points.length == 2){
            this.array[deletedId-1].remove();
            this.array.splice(deletedId-1, 1);
        }
        else{
            console.log(deletedId)
            this.array[deletedId].points[0].remove();
            this.array.splice(deletedId, 1);
        }
    }
}

export {PLpoint, PLLine, PLArray};