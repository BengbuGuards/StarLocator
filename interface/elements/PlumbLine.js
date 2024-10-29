import {ShapeObject, LineObject, markerArray} from './Baseclass.js';

// 线端点类
class PLpoint extends ShapeObject {
    constructor(coordinate, interactPhoto, canvas, id, color) {
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

    // 添加线段移动事件，通常是在添加第二个点后调用
    addMoveLineEvent() {
        this.points[0].point.off('moving');
        this.points[1].point.off('moving');
        this.points[0].point.on('moving', this.onMovePoint.bind(this, this.points[0]));
        this.points[1].point.on('moving', this.onMovePoint.bind(this, this.points[1]));
    }

    // 点移动事件，用于更新线段位置，通常在点移动时调用
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

    // 删除本端点线
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
        // 如果数组为空或者最后一个线段已经有两个点了，就新建一个线段
        if (this.array.length == 0 || this.array.slice(-1)[0].points.length == 2){
            let pl = new PLLine(this.interactPhoto);
            this.array.push(pl);
        }
        // 获取当前最后一个线段
        let lastPLLine = this.array.slice(-1)[0];
        
        let newPointID = this.num() * 2 - 2 + lastPLLine.points.length;
        // 添加点
        let newpPoint = new PLpoint(coordinate, this.interactPhoto, this.interactPhoto.canvas, newPointID, '#35dc96');
        lastPLLine.points.push(newpPoint);

        // 如果有了两个端点，就添加线段
        if (lastPLLine.points.length == 2) {
            let lineCoord = [
                lastPLLine.points[0].coordinate,
                lastPLLine.points[1].coordinate
            ].flat();
            lastPLLine.lineObject = new LineObject(lineCoord, this.interactPhoto.canvas, '#35dc96');
            lastPLLine.addMoveLineEvent();
        } else if (lastPLLine.points.length > 2) {
            console.error('Too many points in a line.');
        }

        // 绑定删除按钮事件
        newpPoint.deleter.on('mousedown', () => {
            this.remove(newpPoint.id);
        }).bind(this);
    }

    remove(id) {
        let deletedId = Math.floor(id/2);
        this.array[deletedId].remove();
        // 删除对应的线段
        this.array.splice(deletedId, 1);
        // 更新后面的线中的点的 ID
        for (let i = deletedId; i < this.num(); ++i){
            for (let j = 0; j < this.array[i].points.length; ++j){
                this.array[i].points[j].id -= 2;
            }
        }
    }
}

export {PLpoint, PLLine, PLArray};