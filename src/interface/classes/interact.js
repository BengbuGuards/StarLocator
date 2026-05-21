import { DefaultbuttonFunctioner } from '../functions/Default.js';
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
        this.celeStatus = null; // 天体标记数量提示
        this.cursorCrd = null; // 鼠标坐标
        this.inputTable = null; // 输入表格
        this.movable = false; // 是否可移动
        this.text = null; // 文本
        this.rect = null; // 矩形
        this.date = null; // 日期
        this.time = null; // 时间
        this.timeZone = null; // 时区

        // 画布对象池
        this.CeleArray = new CeleArray(this); // 星星对象数组
        this.PLArray = new PLArray(this); // 铅垂线对象数组

        // 鼠标事件变量
        this.lmbDown = false; // 鼠标左键是否按下
        this.cancelOp = false; // 是否取消选择星体or铅垂线的操作

        // 按钮功能状态变量
        this.defaultbuttonFunctioner = new DefaultbuttonFunctioner(this);
        this.buttonFunctioner = this.defaultbuttonFunctioner; // 当前按钮事件对象
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

    // 重置按钮功能状态
    resetbuttonFunctioner() {
        this.buttonFunctioner = this.defaultbuttonFunctioner;
    }

    getCompletePLCount() {
        let count = 0;
        const totalRows = this.PLArray.tablePLRowCount();
        for (let i = 1; i <= totalRows; i++) {
            const x1 = parseFloat(document.getElementById(`pl${i}_x1`)?.value);
            const y1 = parseFloat(document.getElementById(`pl${i}_y1`)?.value);
            const x2 = parseFloat(document.getElementById(`pl${i}_x2`)?.value);
            const y2 = parseFloat(document.getElementById(`pl${i}_y2`)?.value);
            if (Number.isFinite(x1) && Number.isFinite(y1) && Number.isFinite(x2) && Number.isFinite(y2)) {
                count++;
            }
        }
        return count;
    }

    // 刷新天体标记数量提示和天体识别按钮状态
    updateCeleStatus() {
        if (!this.celeStatus) return;

        const count = this.CeleArray.num();
        this.celeStatus.innerHTML = this.getCeleStatusText(count);
        this.updateRecognizeButton(count);
        this.updateCalculButton();
    }

    getCeleStatusText(count) {
        if (count < 3) return `已标记天体：${count} / 3，请至少标记 3 个天体后再进行天体识别`;
        return `已标记天体：${count} 个`;
    }

    updateRecognizeButton(count) {
        const recognizeButton = document.getElementById('recognizeStars');
        if (recognizeButton) {
            recognizeButton.classList.toggle('is-disabled', count < 3);
            recognizeButton.setAttribute('aria-disabled', count < 3 ? 'true' : 'false');
        }
    }

    updateCalculButton() {
        const calculButton = document.getElementById('actionCalcul');
        if (!calculButton) return;

        const isDisabled = !this.movable || this.CeleArray.num() < 3 || this.getCompletePLCount() < 2;
        calculButton.classList.toggle('is-disabled', isDisabled);
        calculButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
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
