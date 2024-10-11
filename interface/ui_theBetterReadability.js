// by BengbuGuards小流汗黄豆

// 声明全局变量
var container, canvas, canvasInst, tips, cursorCrd, inputTable; // 容器，画布，画布实例，提示，鼠标坐标，输入表格
var movable = false; // 是否可移动
var text, rect; // 文本，矩形
var map; // 地图

// 星体变量
var points = [], ptLabels = [], numOfPts = 0; // 星星点，标签，星星数量

// 铅垂线变量
let PLPoints = []; // 一条铅垂线的端点
let PLs = []; // 铅垂线
let numPL = 0; // 铅垂线数量
let numPLPoint = 0; // 铅垂线端点数量
let isMovingPLPoint = 0; // 是否正在选择铅垂线端点
let globalPLs = []; // 全局铅垂线

// 鼠标事件变量
var lmbDown = false; // 鼠标左键是否按下
var cancelOp = false // 是否取消选择星体or铅垂线的操作

// 选择事件变量
var isPickingCele = false; // 是否正在选择天体
let isPickingPL = false; // 是否正在选择铅垂线	

// 点基类
class ShapeObject {
    constructor(x, y, id, canvas, Color, label) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.canvas = canvas;
        this.Color = Color;

        this.point = new fabric.Path('M15 0 16 16 17 0ZM0 15 16 16 0 17ZM15 32 16 16 17 32ZM32 17 16 16 32 15Z', {
            left: x - 16,
            top: y - 16,
            width: 32,
            height: 32,
            fill: this.Color,
            hasControls: false,
            id: this.id
        });

        this.label = new fabric.Text(label, {
            left: x + 16,
            top: y - 10,
            fontSize: 16,
            fontFamily: '微软雅黑',
            fill: this.Color,
            selectable: false,
            hoverCursor: 'grab'
        });

        this.point.on('moving', this.onMove.bind(this));
        this.canvas.add(this.point);
        this.canvas.add(this.label);
    }

    onMove() {
        this.label.left = this.point.left + 32;
        this.label.top = this.point.top + 6;
        this.label.setCoords();
    }
}

// 星体类
class CelestialBody extends ShapeObject {
    constructor(x, y, id, canvas) {
        super(x, y, id, canvas, '#FFD248', 'xxx');
    }

    addToTable() {
        document.getElementById(`coordX${this.id}`).value = this.x;
        document.getElementById(`coordY${this.id}`).value = this.y;
    }

	onMove() {
        this.label.left = this.point.left + 32;
        this.label.top = this.point.top + 6;
        this.label.setCoords();

 		// 修改表格内容（貌似性能不是很好）
		document.getElementById(`coordX${this.id}`).value = Math.round((this.point.left + 16) * 100) / 100;
 		document.getElementById(`coordY${this.id}`).value = Math.round((this.point.top + 16) * 100) / 100;
    }
}

// 铅垂线端点类
class PLpoint extends ShapeObject {
    constructor(x, y, id, canvas) {
        super(x, y, id, canvas, '#67B29A', '>>>');
        this.coordinate=[x,y];
    }

    onMove() {
        super.onMove();
        isMovingPLPoint = this.id;

        if(numPLPoint%2==0){
            PLs[Math.ceil(this.id/2)-1][this.id % 2 == 0 ? 1 : 0][0]=this.point.left+16;
            PLs[Math.ceil(this.id/2)-1][this.id % 2 == 0 ? 1 : 0][1]=this.point.top+16;
            console.log(PLs[Math.ceil(this.id/2)-1][this.id % 2 == 0 ? 1 : 0]);
        }
        else{
            PLPoints[0]=this.point.left+16;
            PLPoints[1]=this.point.top+16;
            PLPoints=[PLPoints];
            console.log(PLPoints);
        }
    }

    onMouseUp() {
        isMovingPLPoint = 0;
    }
}

// 线基类
class LineObject {
    constructor(coordinates, id, canvas, Color) {
        this.coordinates = coordinates;
        this.canvas = canvas;
        this.Color = Color;
        this.id = id;

        this.line = new fabric.Line(this.coordinates, {
            fill: this.Color,
            stroke: this.Color,
            strokeWidth: 1,
            selectable: false,
            hoverCursor: 'grab'
        });

        this.canvas.add(this.line);
    }
}

// 铅垂线类
class PLLine extends LineObject {
    constructor(coordinates, id, canvas) {
        super(coordinates, id, canvas, '#67B29A');
    }
}

// 页面加载完成事件
window.onload = function () {
    initializeElements();
    initializeCanvas();
    initializeEvents();
    initializeMap();
}

// 初始化页面元素
function initializeElements() {
    container = document.getElementById('box');
	cursorCrd = document.getElementById('cursorCrd');
	tips = document.getElementById('canvasStatus');
	inputTable = document.getElementById('inputTable')
}

// 初始化画布
function initializeCanvas() {
    canvas = new fabric.Canvas("canvas", {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 'black',
        selection: false
    });

    text = new fabric.IText('选择星空照片。', {
        fill: '#8a6119',
        textAlign: 'center',
        fontSize: 40,
        fontFamily: '等线',
        selectable: false,
        hoverCursor: 'default'
    });
    
    canvas.add(text);
    reZoomCanvas(text, true, false);
    canvasInst = document.getElementsByClassName('upper-canvas')[0];
}

// 初始化事件
function initializeEvents() {
    setCanvasCursor('grab');
    
    // 鼠标事件绑定
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on('mouse:out', handleMouseOut);
    canvas.on('mouse:wheel',handleMouseWheel);

    // 窗口事件绑定
    window.onresize = handleResize;
    
    // 按钮事件绑定
    document.getElementById('resetZoom').addEventListener('click', resetZoom);
    document.getElementById('celePick').addEventListener('click', pickCele);
    document.getElementById('vaniZen').addEventListener('click', pickPL);
    document.getElementById("srcFile").addEventListener('change', onImgChange);
}

// 初始化地图
function initializeMap() {
    map = L.map('map').setView([32.0, 110.0], 3);

	L.tileLayer('https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		minZoom: 2,
		maxZoom: 19,
		subdomains: ['services', 'server'],
		attribution: '球面墨卡托投影 <span aria-hidden="true">|</span> &copy; <a href="https://wiki.openstreetmap.org/wiki/Esri">ArcGIS: Esri World Imagery</a>'
	}).addTo(map);

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
			}).addTo(map);
		})
		.catch(error => {
			console.error('加载JSON数据时出错:', error);
		});
}

// 鼠标模式
function setCanvasCursor(cursor) {
    canvasInst.style.cursor = cursor;
}

// 处理鼠标按下事件
function handleMouseDown(e) {
    lmbDown = true;

    // 画布缩放移动
    if (!isPickingCele && !isPickingPL && movable && canvas.getActiveObject() === undefined) {
        if (!this.panning) {
            setCanvasCursor('grabbing');
        }
        this.panning = true;
        canvas.selection = false;
    }
}

// 处理鼠标抬起事件
function handleMouseUp(e) {
    lmbDown = false;

    // 选择天体
    if (isPickingCele) {
        if (cancelOp) {
            cancelOp = false;
            // 取消操作
        } else {
            // 加入
            let p = canvas.getPointer(e.e);
            addStarAtPoint(p.x, p.y);
        }
        isPickingCele = false;
        tips.innerHTML = '';
        setCanvasCursor('grab');
    } 

    // 选择铅垂线
    else if (isPickingPL) {
        if (cancelOp){
            cancelOp = false;
            // 取消操作
        }
        else {
            // 加入
            let p = canvas.getPointer(e.e);
            addPLEndpoint(p.x, p.y);              
        }
        addPL();
        isPickingPL = false;
        tips.innerHTML = '';
        setCanvasCursor('grab');
    } 

    // 画布移动
    else if (movable && canvas.getActiveObject() === undefined) {
        this.panning = false;
        canvas.selection = true;
        setCanvasCursor('grab');
    }
}

// 处理鼠标移动事件
function handleMouseMove(e) {
    // 星体及铅垂线取消选择
    if (isPickingCele || isPickingPL) {
        CancelPicking(e);
    }

    // 铅垂线跟随
    if (numPL>0 && isMovingPLPoint){
        globalPLs[Math.ceil(isMovingPLPoint/2-1)].line.set({
            x1: PLs[Math.ceil(isMovingPLPoint/2-1)][0][0],
            y1: PLs[Math.ceil(isMovingPLPoint/2-1)][0][1],
            x2: PLs[Math.ceil(isMovingPLPoint/2-1)][1][0],
            y2: PLs[Math.ceil(isMovingPLPoint/2-1)][1][1]
        });
        globalPLs[Math.ceil(isMovingPLPoint/2-1)].line.setCoords(); // 更新线的位置
        canvas.renderAll(); // 刷新画布以显示更改
        console.log(typeof globalPLs); // 检查数组内容
    }

    // 坐标显示
    if (movable && e && !this.panning) {
        let p = canvas.getPointer(e.e);
        cursorCrd.innerHTML = `${Math.round(p.x)}，${Math.round(p.y)}`;
    }

    // 处理画布移动
    if (this.panning && e && e.e) {
        var delta = new fabric.Point(e.e.movementX, e.e.movementY);
        canvas.relativePan(delta);
    }
}

// 星体及铅垂线取消选择
function CancelPicking(e) {
    if (lmbDown) {
        cancelOp = true;
        canvas.selection = false;
        tips.innerHTML = '松开鼠标取消标记。';
        setCanvasCursor('not-allowed');
        return;
    }
    setCanvasCursor('crosshair');
}

// 处理鼠标移出事件
function handleMouseOut(e) {
    if (movable && e) {
        let p = canvas.getPointer(e.e);
		cursorCrd.innerHTML = '';
    }
}

// 处理鼠标滚轮事件用于缩放照片大小
function handleMouseWheel(opt) {
    if (!movable)               return;   
    opt.e.preventDefault();
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom(); // 使用 canvas 直接引用
    zoom *= 0.999 ** delta;

    if (zoom > 20)              zoom = 20;
    if (zoom < 0.01)                zoom = 0.1;

    canvas.zoomToPoint({
        x: opt.e.offsetX,
        y: opt.e.offsetY
    }, 
    zoom);
}

// 处理页面改变大小事件
function handleResize() {
    canvas.setWidth(container.clientWidth);
    canvas.setHeight(container.clientHeight);
    if (movable) reZoomCanvas(rect);
    else reZoomCanvas(text, true, false);
}

// 调整画布的缩放和视图位置
function reZoomCanvas(rect, alignRect = false, resize = true) {
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var scale = Math.min(scaleX, scaleY);
    var newX = canvas.width / 2 - rect.width / 2, newY = canvas.height / 2 - rect.height / 2
    if (alignRect)      canvas.setViewportTransform([1, 0, 0, 1, newX, newY]);
    else canvas.setViewportTransform([1, 0, 0, 1, canvas.width / 2, canvas.height / 2]);
    if (resize)     canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, scale);
}

// 选择重置缩放事件
function resetZoom() {
    if (movable)        reZoomCanvas(rect);
}

// 选择天体事件
function pickCele() {
    if (!movable)       return;
    isPickingCele = !isPickingCele;
    tips.innerHTML = `${isPickingCele ? '单击要选择的天体。' : ''}`;
}

// 选择铅垂线事件
function pickPL() {
    if (!movable)       return;
    isPickingPL = !isPickingPL;
    tips.innerHTML = `${isPickingPL ? '单击添加铅垂线端点。' : ''}`;
}

// 读取到文件事件
function onImgChange(e) {
    let file = e.target.files[0];
		let reader = new FileReader();
		reader.onload = function (e) {
			let img = new Image();
			img.onload = function () {
				let width = img.width, height = img.height;
				// 移除先前图片
				if (rect != undefined)      canvas.remove(rect);
				// 创建图片Rect
				let pattern = new fabric.Pattern({
					source: img,
					repeat: 'repeat'
				});
				rect = new fabric.Rect({
					left: width / (-2),
					top: height / (-2),
					width: width,
					height: height,
					fill: pattern,
					selectable: false,
					hoverCursor: 'grab'
				});
				canvas.add(rect);
				// 更新页面
				document.getElementById('picInfo').innerHTML = `${img.width} × ${img.height}&nbsp;&nbsp;&nbsp;`;
				reZoomCanvas(rect);
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
		movable = true;
		canvas.selection = true;
		canvas.defaultCursor = 'grab';
		canvas.remove(text);
}

// 添加星星点的函数
function addStarAtPoint(x, y) {
	// 保留两位小数
	x = Math.round(x * 100) / 100;
	y = Math.round(y * 100) / 100;
    numOfPts++;

	// 判断星星数量是否已超过表格行数
	let inputTable = document.getElementById('inputTable');
	if (numOfPts > inputTable.rows.length - 2) {	// 减掉一行标题与一行天顶
		// 添加一行
		let newRow = inputTable.insertRow(numOfPts + 1);
		// 添加单元格
		let secondStarRow = inputTable.rows[3];
		// 第二颗星星的行，用于 HTML 模板
		// 为什么不用第一行：style="flex: 1" 出现在属性里，这不应被替换
		for (let i = 0; i <= 5; ++i) {
			newRow.insertCell(i).innerHTML	// 将第二行 HTML 抄过来并替换数字
				= secondStarRow.cells[i].innerHTML.replace('2', `${numOfPts}`);
		}
	}

    let star = new CelestialBody(x, y, numOfPts, canvas);
    star.addToTable();
    points.push(star.point);
    ptLabels.push(star.label);
}

// 添加铅垂线端点的函数
function addPLEndpoint(x, y) {
    numPLPoint++;
    let plpoint = new PLpoint(x, y, numPLPoint, canvas);
    PLPoints.push([x,y]);
    console.log(PLPoints);
}

function addPL(){
	if (PLPoints.length==2){
		numPL++;
		PLs.push(PLPoints);
        console.log(PLs);
        let pl = new PLLine(PLPoints.flat(), numPL, canvas);
        globalPLs.push(pl);
		PLPoints=[];
	}
}