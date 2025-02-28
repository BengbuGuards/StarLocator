import { Canvas, IText } from 'fabric';
import { TouchEventAdapter } from '@/interface/classes/TouchEventAdapter.js';
import { autoCompleteStarName } from './functions/AutoComplete.js';
import { useButtonFunStore } from '@/store/buttonFun';

// 初始化页面元素
function initializeElements(interactPhoto) {
    interactPhoto.container = document.getElementById('box');
    interactPhoto.cursorCrd = document.getElementById('cursorCrd');
    interactPhoto.tips = document.getElementById('canvasStatus');
    interactPhoto.inputTable = document.getElementById('inputTable');
    interactPhoto.date = document.getElementById('setDate');
    interactPhoto.time = document.getElementById('setTime');
    interactPhoto.timeZone = document.getElementById('setTimeZone');
    interactPhoto.setDatebyTime(new Date().getTime() / 1000); // 设置当前日期、时间、时区
}

// 初始化画布
function initializeCanvas(interactPhoto) {
    interactPhoto.canvas = new Canvas('canvas', {
        width: interactPhoto.container.clientWidth,
        height: interactPhoto.container.clientHeight,
        backgroundColor: 'black',
        selection: false,
    });

    interactPhoto.text = new IText('选择星空照片。', {
        fill: '#8a6119',
        textAlign: 'center',
        fontSize: 40,
        fontFamily: '等线',
        selectable: false,
        hoverCursor: 'default',
    });

    interactPhoto.canvas.add(interactPhoto.text);
    interactPhoto.reZoomCanvas(interactPhoto.text, true, false);
    interactPhoto.canvasInst = document.getElementsByClassName('upper-canvas')[0];
}

// 初始化事件
function initializeEvents(interactPhoto) {
    interactPhoto.setCanvasCursor('grab');

    const buttonFunStore = useButtonFunStore();

    // 鼠标事件绑定
    interactPhoto.canvas.on('mouse:down', (e) => buttonFunStore.handleMouseDown(e));
    interactPhoto.canvas.on('mouse:up', (e) => buttonFunStore.handleMouseUp(e));
    interactPhoto.canvas.on('mouse:move', (e) => buttonFunStore.handleMouseMove(e));
    interactPhoto.canvas.on('mouse:out', (e) => buttonFunStore.handleMouseOut(e));
    interactPhoto.canvas.on('mouse:wheel', (opt) => buttonFunStore.handleMouseWheel(opt));

    // 兼容手机端事件绑定
    const touchEventer = new TouchEventAdapter();
    const touchEventAdapter = touchEventer.adapter.bind(touchEventer);
    interactPhoto.canvasInst.addEventListener('touchstart', (e) =>
        buttonFunStore.handleMouseDown(touchEventAdapter(e))
    );
    interactPhoto.canvasInst.addEventListener('touchend', (e) =>
        buttonFunStore.handleMouseUp(touchEventAdapter(e))
    );
    interactPhoto.canvasInst.addEventListener('touchmove', (e) =>
        buttonFunStore.handleMouseMove(touchEventAdapter(e))
    );
    interactPhoto.canvasInst.addEventListener('touchcancel', (e) =>
        buttonFunStore.handleMouseOut(touchEventAdapter(e))
    );

    // 窗口事件绑定
    window.onresize = buttonFunStore.handleResize.bind(interactPhoto);

    //为星体名称输入框启用自动补全
    for (let i = 1; i <= 5; i++) {
        autoCompleteStarName(document.getElementById(`name${i}`));
    }
}

// 初始化地图
function initializeMap(interactPhoto) {
    /*global BMapGL*/
    // 按住鼠标右键，修改倾斜角和角度
    let map = new BMapGL.Map('map'); // 创建Map实例
    map.centerAndZoom(new BMapGL.Point(110, 35), 4); // 初始化地图,设置中心点坐标和地图级别
    map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
    map.addControl(new BMapGL.ScaleControl()); // 添加比例尺控件
    map.addControl(new BMapGL.ZoomControl()); // 添加缩放控件
    map.addControl(new BMapGL.MapTypeControl()); //添加地图类型控件
    interactPhoto.map = map;
}

export { initializeElements, initializeCanvas, initializeEvents, initializeMap };
