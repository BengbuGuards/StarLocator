import { initializeElements, initializeCanvas, initializeEvents, initializeMap } from '../init.js';
import { PickCele } from '../functions/PickCele.js';
import { PickPL } from '../functions/PickPL.js';
import { ImageChange } from '../functions/ImageChange.js';
import { Calc } from '../functions/calc.js';

// 事件管理器，管理鼠标事件、按钮事件与照片的交互
class EventManager{
    constructor(interactPhoto){
        this.interactPhoto = interactPhoto;
        
        this.pickCele = new PickCele(this.interactPhoto);
        this.pickPL = new PickPL(this.interactPhoto);
        this.imageChange = new ImageChange(this.interactPhoto);
        this.calc = new Calc(this.interactPhoto);

        // 页面加载完成事件
        window.onload = function () {
            initializeElements(this.interactPhoto);
            initializeCanvas(this.interactPhoto);
            initializeEvents(this);
            initializeMap(this.interactPhoto);
        }.bind(this);
    }

    // 鼠标事件处理
    // 处理鼠标按下事件
    handleMouseDown(e) {
        this.interactPhoto.buttonFonctioner.handleMouseDown(e);
    }

    // 处理鼠标抬起事件
    handleMouseUp(e) {
        this.interactPhoto.buttonFonctioner.handleMouseUp(e);
    }

    // 处理鼠标移动事件
    handleMouseMove(e) {
        this.interactPhoto.buttonFonctioner.handleMouseMove(e);
    }

    // 处理鼠标移出事件
    handleMouseOut(e) {
        this.interactPhoto.buttonFonctioner.handleMouseOut(e);
    }

    // 处理鼠标滚轮事件用于缩放照片大小
    handleMouseWheel(opt) {
        this.interactPhoto.buttonFonctioner.handleMouseWheel(opt);
    }

    // 处理页面改变大小事件
    handleResize() {
        this.interactPhoto.buttonFonctioner.handleResize();
    }
}

export { EventManager };