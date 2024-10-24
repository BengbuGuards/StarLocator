class TouchEventAdapter{
    constructor(){
        this.lastPageX;  // 上次触摸点横坐标
        this.lastPageY;  // 上次触摸点纵坐标
        this.lastDistance;  // 上次触摸点距离
    }

    adapter(e) {
        let eAdapter = { ...e };
        eAdapter.e = e;
        // 触摸事件适配
        if (e.type === 'touchstart')  {
            eAdapter = this.touchStart(eAdapter);
        } else if (e.type === 'touchend') {
            eAdapter = this.touchEnd(eAdapter);
        } else if (e.type === 'touchmove') {
            eAdapter = this.touchMove(eAdapter);
        } else if (e.type === 'touchcancel') {
            eAdapter = this.touchCancel(eAdapter);
        }
        return eAdapter;
    }

    // 处理触摸开始事件
    touchStart(e){
        this.lastPageX = e.pageX;
        this.lastPageY = e.pageY;
        if (e.e.targetTouches.length == 2) {
            this.lastDistance = Math.sqrt(
                Math.pow(e.e.targetTouches[0].pageX - e.e.targetTouches[1].pageX, 2) + 
                Math.pow(e.e.targetTouches[0].pageY - e.e.targetTouches[1].pageY, 2)
            );
        }
        return e;
    }

    // 处理触摸结束事件
    touchEnd(e){
        return e;
    }

    // 处理触摸移动事件
    touchMove(e){
        if (this.lastPageX === undefined || this.lastPageY === undefined) {
            e.e.movementX = 0;
            e.e.movementY = 0;
        } else {
            e.e.movementX = e.e.targetTouches[0].pageX - this.lastPageX;
            e.e.movementY = e.e.targetTouches[0].pageY - this.lastPageY;
        }
        this.lastPageX = e.e.targetTouches[0].pageX;
        this.lastPageY = e.e.targetTouches[0].pageY;

        if (e.e.targetTouches.length == 2) {
            let distance = Math.sqrt(
                Math.pow(e.e.targetTouches[0].pageX - e.e.targetTouches[1].pageX, 2) + 
                Math.pow(e.e.targetTouches[0].pageY - e.e.targetTouches[1].pageY, 2)
            );
            e.e.scale = distance / this.lastDistance;
            this.lastDistance = distance;
        }
        return e;
    }

    // 处理触摸取消事件
    touchCancel(e){
        return e;
    }
}


export { TouchEventAdapter };