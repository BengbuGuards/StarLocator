// import { DefaultbuttonFunctioner } from '../functions/Default.js';
import { CeleArray } from '../elements/CelestialBody.js';
import { PLArray } from '../elements/PlumbLine.js';

// 照片与其可交互信息的类
class InteractPhoto {
    constructor() {
        // 页面各元素变量
        this.img = null; // 照片
        this.container = null; // 容器
        this.canvas = null; // 画布
        this.canvasInst = null; // 画布实例
        this.tips = null; // 提示
        this.cursorCrd = null; // 鼠标坐标
        this.inputTable = null; // 输入表格
        this.movable = false; // 是否可移动
        this.text = null; // 文本
        this.rect = null; // 矩形
        this.map = null; // 地图
        this.date = null; // 日期
        this.time = null; // 时间
        this.timeZone = null; // 时区

        // 画布对象池
        this.CeleArray = new CeleArray(this); // 星星对象数组
        this.PLArray = new PLArray(this); // 铅垂线对象数组

        // 鼠标事件变量
        this.lmbDown = false; // 鼠标左键是否按下
        this.cancelOp = false; // 是否取消选择星体or铅垂线的操作
    }

    // 调整画布的缩放和视图位置
    reZoomCanvas(rect, alignRect = false, resize = true) {
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        var scale = Math.min(scaleX, scaleY);
        var newX = this.canvas.width / 2 - rect.width / 2,
            newY = this.canvas.height / 2 - rect.height / 2;
        if (alignRect) this.canvas.setViewportTransform([1, 0, 0, 1, newX, newY]);
        else this.canvas.setViewportTransform([1, 0, 0, 1, this.canvas.width / 2, this.canvas.height / 2]);
        if (resize) this.canvas.zoomToPoint({ x: this.canvas.width / 2, y: this.canvas.height / 2 }, scale);
    }

    // 鼠标模式
    setCanvasCursor(cursor) {
        this.canvasInst.style.cursor = cursor;
    }

    // 获取当前日期时间时区的时间戳
    getTimestamp() {
        let timeZoneOffset = this.timeZone.value;
        if (timeZoneOffset.length === 1) {
            timeZoneOffset = '0' + timeZoneOffset + ':00';
        } else if (timeZoneOffset.length === 2) {
            timeZoneOffset = timeZoneOffset + ':00';
        }

        let date = new Date(
            this.date.value + 'T' + this.time.value + (this.timeZone.value >= 0 ? '+' : '') + timeZoneOffset
        );

        return date.getTime() / 1000;
    }

    /**
     * 设置日期时间时区
     * @param {Number} timestamp 日期时间
     */
    setDatebyTime(timestamp) {
        let datetime = new Date(timestamp * 1000);
        let date = datetime.toLocaleDateString().split('/');
        let year = date[0];
        let month = date[1];
        let day = date[2];
        this.date.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        this.time.value = datetime.toLocaleTimeString();
        this.timeZone.value = -datetime.getTimezoneOffset() / 60;
    }
}

export { InteractPhoto };
