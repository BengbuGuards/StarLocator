import { initializeElements, initializeCanvas, initializeEvents, initializeMap } from '../init.js';
import { TouchEventAdapter } from './TouchEventAdapter.js';
import { PickCele } from '../functions/PickCele.js';
import { PickPL } from '../functions/PickPL.js';
import { ImageChange } from '../functions/ImageChange.js';
import { Calc } from '../functions/Calc.js';
import { MoonTime } from '../functions/MoonTime.js';
import { CeleCoord } from '../functions/CeleCoord.js';
import { AstroCalculator } from '../../core/AstroCoord/calc.js';

// 事件管理器，管理鼠标事件、按钮事件与照片的交互
class EventManager {
    constructor(interactPhoto) {
        this.interactPhoto = interactPhoto;
        this.touchEventAdapter = new TouchEventAdapter();

        // 事件共享变量
        this.astroCalculator = new AstroCalculator();
        this.celeCoord = new CeleCoord(this.interactPhoto, this.astroCalculator);

        // 按钮事件处理类
        this.pickCele = new PickCele(this.interactPhoto);
        this.pickPL = new PickPL(this.interactPhoto);
        this.imageChange = new ImageChange(this.interactPhoto, this.clearAllData.bind(this));
        this.calc = new Calc(this.interactPhoto, this.celeCoord);
        this.moonTime = new MoonTime(this.interactPhoto, this.astroCalculator, this.celeCoord);

        // 页面加载完成事件
        window.onload = function () {
            initializeElements(this.interactPhoto);
            initializeCanvas(this.interactPhoto);
            initializeEvents(this);
            initializeMap(this.interactPhoto);
        }.bind(this);
    }

    // 重置所有标注数据
    clearAllData() {
        this.interactPhoto.buttonFunctioner = this.interactPhoto.defaultbuttonFunctioner;
        this.pickCele.clearData();
        this.pickPL.clearData();
        this.calc.clearData();
        this.interactPhoto.CeleArray.clear(); // 清空表格数据
    }

    // 鼠标事件处理
    // 处理鼠标按下事件
    handleMouseDown(e) {
        this.interactPhoto.buttonFunctioner.handleMouseDown(e);
    }

    // 处理鼠标抬起事件
    handleMouseUp(e) {
        this.interactPhoto.buttonFunctioner.handleMouseUp(e);
    }

    // 处理鼠标移动事件
    handleMouseMove(e) {
        this.interactPhoto.buttonFunctioner.handleMouseMove(e);
    }

    // 处理鼠标移出事件
    handleMouseOut(e) {
        this.interactPhoto.buttonFunctioner.handleMouseOut(e);
    }

    // 处理鼠标滚轮事件用于缩放照片大小
    handleMouseWheel(opt) {
        this.interactPhoto.buttonFunctioner.handleMouseWheel(opt);
    }

    // 处理页面改变大小事件
    handleResize() {
        this.interactPhoto.buttonFunctioner.handleResize();
    }
}

export { EventManager };
