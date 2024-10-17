// 默认按钮功能类，所有按钮功能类的父类
class DefaultButtonFonctioner{
    constructor(interactPhoto){
        this.interactPhoto = interactPhoto;
        this.panning = false;   // 是否正在移动画布
    }

    // 点击事件逻辑
    onClick() {
        if (!this.interactPhoto.movable) return;
    }

    // 按钮事件处理
    // 重置标注
    clearData() {
        // TODO
    }
    
    // 选择重置缩放事件
    resetZoom() {
        if (!this.interactPhoto.movable) return;
        this.interactPhoto.reZoomCanvas(this.interactPhoto.rect);
    }

    // 处理鼠标按下事件
    handleMouseDown(e) {
        this.interactPhoto.lmbDown = true;
        
        if (!this.interactPhoto.movable) return;
        // 画布缩放移动
        if (this.interactPhoto.buttonFonctioner === this.interactPhoto.defaultButtonFonctioner
            && this.interactPhoto.canvas.getActiveObject() === undefined) {
            if (!this.panning) {
                this.interactPhoto.setCanvasCursor('grabbing');
            }
            this.panning = true;
            this.interactPhoto.canvas.selection = false;
        }
    }

    // 处理鼠标抬起事件
    handleMouseUp(e) {
        this.interactPhoto.lmbDown = false;
        
        if (!this.interactPhoto.movable) return;
        // 画布移动
        if (this.interactPhoto.canvas.getActiveObject() === undefined) {
            this.panning = false;
            this.interactPhoto.canvas.selection = true;
            this.interactPhoto.setCanvasCursor('grab');
        }
    }

    // 处理鼠标移动事件
    handleMouseMove(e) {
        // 星体及铅垂线取消选择
        if (this.interactPhoto.buttonFonctioner != this.interactPhoto.defaultButtonFonctioner) {
            this.CancelPicking(e);
        }

        // 铅垂线跟随
        if (this.interactPhoto.numPL>0 && this.interactPhoto.movingPLPointID){
            this.interactPhoto.globalPLs[Math.ceil(this.interactPhoto.movingPLPointID/2-1)].line.set({
                x1: this.interactPhoto.PLs[Math.ceil(this.interactPhoto.movingPLPointID/2-1)][0][0],
                y1: this.interactPhoto.PLs[Math.ceil(this.interactPhoto.movingPLPointID/2-1)][0][1],
                x2: this.interactPhoto.PLs[Math.ceil(this.interactPhoto.movingPLPointID/2-1)][1][0],
                y2: this.interactPhoto.PLs[Math.ceil(this.interactPhoto.movingPLPointID/2-1)][1][1]
            });
            this.interactPhoto.globalPLs[Math.ceil(this.interactPhoto.movingPLPointID/2-1)].line.setCoords(); // 更新线的位置
            this.interactPhoto.canvas.renderAll(); // 刷新画布以显示更改
            console.log(typeof globalPLs); // 检查数组内容
        }

        // 坐标显示
        if (this.interactPhoto.movable && e && !this.panning) {
            let p = this.interactPhoto.canvas.getPointer(e.e);
            this.interactPhoto.cursorCrd.innerHTML = `${Math.round(p.x)}，${Math.round(p.y)}`;
        }

        // 处理画布移动
        if (this.panning && e && e.e) {
            var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            this.interactPhoto.canvas.relativePan(delta);
        }
    }

    // 处理鼠标移出事件
    handleMouseOut(e) {
        if (!this.interactPhoto.movable) return;
        if (e) {
            let p = this.interactPhoto.canvas.getPointer(e.e);
            this.interactPhoto.cursorCrd.innerHTML = '';
        }
    }

    // 处理鼠标滚轮事件用于缩放照片大小
    handleMouseWheel(opt) {
        if (!this.interactPhoto.movable) return;   

        opt.e.preventDefault();
        const delta = opt.e.deltaY;
        let zoom = this.interactPhoto.canvas.getZoom(); // 使用 canvas 直接引用
        zoom *= 0.999 ** delta;
    
        if (zoom > 20)              zoom = 20;
        if (zoom < 0.01)                zoom = 0.1;
    
        this.interactPhoto.canvas.zoomToPoint({
            x: opt.e.offsetX,
            y: opt.e.offsetY
        }, 
        zoom);
    }

    // 处理页面改变大小事件
    handleResize() {
        this.interactPhoto.canvas.setWidth(this.interactPhoto.container.clientWidth);
        this.interactPhoto.canvas.setHeight(this.interactPhoto.container.clientHeight);
        if (this.interactPhoto.movable){
            this.interactPhoto.reZoomCanvas(this.interactPhoto.rect);
        } else {
            this.interactPhoto.reZoomCanvas(this.interactPhoto.text, true, false);
        }
    }

    // 取消选择星体or铅垂线
    CancelPicking(e) {
        if (this.interactPhoto.lmbDown) {
            this.interactPhoto.cancelOp = true;
            this.interactPhoto.canvas.selection = false;
            this.interactPhoto.tips.innerHTML = '松开鼠标取消标记。';
            this.interactPhoto.setCanvasCursor('not-allowed');
            return;
        }
        this.interactPhoto.setCanvasCursor('crosshair');
    }
}

export { DefaultButtonFonctioner };