import * as fabric from '../fabric/dist/fabric.mjs';

// 初始化页面元素
function initializeElements(interactPhoto) {
    interactPhoto.container = document.getElementById('box');
    interactPhoto.cursorCrd = document.getElementById('cursorCrd');
    interactPhoto.tips = document.getElementById('canvasStatus');
    interactPhoto.inputTable = document.getElementById('inputTable');
}

// 初始化画布
function initializeCanvas(interactPhoto) {
    interactPhoto.canvas = new fabric.Canvas("canvas", {
        width: interactPhoto.container.clientWidth,
        height: interactPhoto.container.clientHeight,
        backgroundColor: 'black',
        selection: false
    });

    interactPhoto.text = new fabric.IText('选择星空照片。', {
        fill: '#8a6119',
        textAlign: 'center',
        fontSize: 40,
        fontFamily: '等线',
        selectable: false,
        hoverCursor: 'default'
    });
    
    interactPhoto.canvas.add(interactPhoto.text);
    interactPhoto.reZoomCanvas(interactPhoto.text, true, false);
    interactPhoto.canvasInst = document.getElementsByClassName('upper-canvas')[0];
}

// 初始化事件
function initializeEvents(buttonManager) {
    let interactPhoto = buttonManager.interactPhoto;
    interactPhoto.setCanvasCursor('grab');
    
    // 鼠标事件绑定
    interactPhoto.canvas.on("mouse:down", e => buttonManager.handleMouseDown.call(buttonManager, e));
    interactPhoto.canvas.on("mouse:up", e => buttonManager.handleMouseUp.call(buttonManager, e));
    interactPhoto.canvas.on("mouse:move", e => buttonManager.handleMouseMove.call(buttonManager, e));
    interactPhoto.canvas.on('mouse:out', e => buttonManager.handleMouseOut.call(buttonManager, e));
    interactPhoto.canvas.on('mouse:wheel', opt => buttonManager.handleMouseWheel.call(buttonManager, opt));

    // 窗口事件绑定
    window.onresize = buttonManager.handleResize.call(buttonManager);
    
    // 按钮事件绑定
    document.getElementById('resetPick').addEventListener('click', interactPhoto.buttonFonctioner.clearData.bind(interactPhoto.buttonFonctioner));
    document.getElementById('resetZoom').addEventListener('click', interactPhoto.buttonFonctioner.resetZoom.bind(interactPhoto.buttonFonctioner));
    document.getElementById('celePick').addEventListener('click', buttonManager.pickCele.onClick.bind(buttonManager.pickCele));
    document.getElementById('vaniZen').addEventListener('click', buttonManager.pickPL.onClick.bind(buttonManager.pickPL));
    document.getElementById("srcFile").addEventListener('change', e => buttonManager.imageChange.onClick.call(buttonManager.imageChange, e));
}

// 初始化地图
function initializeMap(interactPhoto) {
    interactPhoto.map = L.map('map').setView([32.0, 110.0], 3);

    L.tileLayer('https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 2,
        maxZoom: 19,
        subdomains: ['services', 'server'],
        attribution: '球面墨卡托投影 <span aria-hidden="true">|</span> &copy; <a href="https://wiki.openstreetmap.org/wiki/Esri">ArcGIS: Esri World Imagery</a>'
    }).addTo(interactPhoto.map);

    document.getElementsByClassName('leaflet-control-attribution leaflet-control')[0].getElementsByTagName('a')[0].title = '一个交互式地图 JavaScript 库';
    document.getElementsByClassName('leaflet-control-zoom-in')[0].title = '放大';
    document.getElementsByClassName('leaflet-control-zoom-out')[0].title = '缩小';
    document.getElementsByClassName('leaflet-attribution-flag')[0].remove();

    // 加载边境线GeoJSON数据
    fetch('leaflet/dist/CNP.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不是正常的状态');
            }
            return response.json();
        })
        .then(data => {
            // console.log(data);
            L.geoJSON(data, {
                style: function (feature) {
                    return {
                        color: feature.properties.level == 'province' ? '#FF0' : '#F00',
                        weight: feature.properties.level == 'province' ? 1 : 2,
                        opacity: 0.8,
                        fill: false
                    };
                }
            }).addTo(interactPhoto.map);
        })
        .catch(error => {
            console.error('加载JSON数据时出错:', error);
        });
}


export { initializeElements, initializeCanvas, initializeEvents, initializeMap }