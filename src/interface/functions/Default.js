import { Point} from 'fabric'

// 默认按钮功能类，所有按钮功能类的父类
class DefaultbuttonFunctioner{
    constructor(interactPhoto){
        this.interactPhoto = interactPhoto;
        this.panning = false;   // 是否正在移动画布
    }

    // 点击事件逻辑
    onClick() {
        if (!this.interactPhoto.movable) return;
    }

    // 按钮事件处理
    // 重置标注数据
    clearData() {
        
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
        if (this.interactPhoto.buttonFunctioner === this.interactPhoto.defaultbuttonFunctioner
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
        if (this.interactPhoto.buttonFunctioner === this.interactPhoto.defaultbuttonFunctioner
            && this.interactPhoto.canvas.getActiveObject() === undefined) {
            this.panning = false;
            this.interactPhoto.canvas.selection = true;
            this.interactPhoto.setCanvasCursor('grab');
        }
    }

    // 处理鼠标移动事件
    handleMouseMove(e) {
        // 星体及铅垂线取消选择
        if (this.interactPhoto.buttonFunctioner != this.interactPhoto.defaultbuttonFunctioner) {
            this.CancelPicking(e);
        }

        // 坐标显示
        if (this.interactPhoto.movable && e && !this.panning) {
            let p = this.interactPhoto.canvas.getPointer(e.e);
            this.interactPhoto.cursorCrd.innerHTML = `${Math.round(p.x*100)/100}，${Math.round(p.y*100)/100}`;
        }

        // 处理画布移动
        if (this.panning && e) {
            let isTouch = e.e.targetTouches !== undefined;
            if (!isTouch || e.e.targetTouches.length ==1) {
                var delta = new Point(e.e.movementX, e.e.movementY);
                this.interactPhoto.canvas.relativePan(delta);
            } else if (e.e.targetTouches.length == 2) {
                if (e.e.scale === undefined) return;
                let zoom = this.interactPhoto.canvas.getZoom();
                zoom *= e.e.scale;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.1;
                this.interactPhoto.canvas.zoomToPoint({
                    x: (e.e.targetTouches[0].pageX + e.e.targetTouches[1].pageX) / 2,
                    y: (e.e.targetTouches[0].pageY + e.e.targetTouches[1].pageY) / 2
                }, 
                zoom);
            }
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
    
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.1;
    
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

export { DefaultbuttonFunctioner };