import { Canvas, IText } from 'fabric';

// 初始化页面元素
function initializeElements(interactPhoto) {
    interactPhoto.container = document.getElementById('box');
    interactPhoto.cursorCrd = document.getElementById('cursorCrd');
    interactPhoto.tips = document.getElementById('canvasStatus');
    interactPhoto.celeStatus = document.getElementById('celeStatus');
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

    interactPhoto.text = new IText('拖拽星空照片到此处', {
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
function initializeEvents(eventManager) {
    let interactPhoto = eventManager.interactPhoto;
    interactPhoto.setCanvasCursor('grab');

    // 鼠标事件绑定
    interactPhoto.canvas.on('mouse:down', (e) => eventManager.handleMouseDown.call(eventManager, e));
    interactPhoto.canvas.on('mouse:up', (e) => eventManager.handleMouseUp.call(eventManager, e));
    interactPhoto.canvas.on('mouse:move', (e) => eventManager.handleMouseMove.call(eventManager, e));
    interactPhoto.canvas.on('mouse:out', (e) => eventManager.handleMouseOut.call(eventManager, e));
    interactPhoto.canvas.on('mouse:wheel', (opt) => eventManager.handleMouseWheel.call(eventManager, opt));

    // 兼容手机端事件绑定
    let touchEventAdapter = eventManager.touchEventAdapter.adapter.bind(eventManager.touchEventAdapter);
    interactPhoto.canvasInst.addEventListener('touchstart', (e) =>
        eventManager.handleMouseDown.call(eventManager, touchEventAdapter(e))
    );
    interactPhoto.canvasInst.addEventListener('touchend', (e) =>
        eventManager.handleMouseUp.call(eventManager, touchEventAdapter(e))
    );
    interactPhoto.canvasInst.addEventListener('touchmove', (e) =>
        eventManager.handleMouseMove.call(eventManager, touchEventAdapter(e))
    );
    interactPhoto.canvasInst.addEventListener('touchcancel', (e) =>
        eventManager.handleMouseOut.call(eventManager, touchEventAdapter(e))
    );

    // 窗口事件绑定
    window.onresize = eventManager.handleResize.call(eventManager);

    // 按钮事件绑定
    document.getElementById('resetPick').addEventListener('click', eventManager.clearAllData.bind(eventManager));
    document
        .getElementById('resetZoom')
        .addEventListener('click', interactPhoto.buttonFunctioner.resetZoom.bind(interactPhoto.buttonFunctioner));
    document
        .getElementById('celePick')
        .addEventListener('click', eventManager.pickCele.onClick.bind(eventManager.pickCele));
    document.getElementById('vaniZen').addEventListener('click', eventManager.pickPL.onClick.bind(eventManager.pickPL));
    document
        .getElementById('srcFile')
        .addEventListener('change', (e) => eventManager.imageChange.onClick.call(eventManager.imageChange, e));
    interactPhoto.container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        interactPhoto.container.classList.add('drag-over');
    });
    interactPhoto.container.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!interactPhoto.container.contains(e.relatedTarget)) {
            interactPhoto.container.classList.remove('drag-over');
        }
    });
    interactPhoto.container.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        interactPhoto.container.classList.remove('drag-over');
        eventManager.imageChange.loadFile(e.dataTransfer.files[0]);
    });
    document
        .getElementById('actionCalcul')
        .addEventListener('click', eventManager.calc.onClick.bind(eventManager.calc));
    document
        .getElementById('moonTime')
        .addEventListener('click', eventManager.moonTime.onClick.bind(eventManager.moonTime));
    document
        .getElementById('selectStars')
        .addEventListener('click', eventManager.selectStars.onClick.bind(eventManager.selectStars));
    document
        .getElementById('recognizeStars')
        .addEventListener('click', eventManager.recognizeStars.onClick.bind(eventManager.recognizeStars));
    document.getElementById('addCeleRow').addEventListener('click', () => {
        interactPhoto.CeleArray.addEmptyRow();
    });

    //为星体名称输入框启用自动补全
    interactPhoto.CeleArray.initializeTableRows();
}

export { initializeElements, initializeCanvas, initializeEvents };
