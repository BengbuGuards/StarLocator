// by BengbuGuards小流汗黄豆
var container, canvas, canvasInst, tips, cursorCrd, inputTable;		// 容器，画布，画布实例，提示，鼠标坐标，输入表格
var movable = false;		// 是否可移动
var text, rect;		// 文本，矩形
var map;		// 地图

var points = [], ptLabels = [], numOfPts = 0;		// 星星点，标签，星星数量

let linePoints = []; // 存储一对铅垂线的端点
let lines = []; // 铅垂线
let numLine=0; // 铅垂线数量
let numLinePoint=0; // 铅垂线端点数量
let lineLabels = []; // 铅垂线标签

var lmbDown = false, cancelOp = false;		// 鼠标左键是否按下，是否取消操作

var isPickingCele = false;		// 是否正在选择天体
let isPickingPL = false;		// 是否正在选择铅垂线	

// 页面加载完成事件
window.onload = function () {
	container = document.getElementById('box');
	cursorCrd = document.getElementById('cursorCrd');
	tips = document.getElementById('canvasStatus');
	inputTable = document.getElementById('inputTable')

	// 初始化画布
	canvas = new fabric.Canvas("canvas", {
		width: container.clientWidth,
		height: container.clientHeight,
		backgroundColor: 'black',
		selection: false
	})
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

	function setCanvasCursor(cursor) {
		canvasInst.style.cursor = cursor;
	}
	// 画布缩放移动
	canvas.on("mouse:down", function (e) {
		lmbDown = true;
		if (!isPickingCele && !isPickingPL && movable && canvas.getActiveObject() == undefined) {
			if (!this.panning) {
				setCanvasCursor('grabbing');
			}
			this.panning = true;
			canvas.selection = false;
		}
	});
	canvas.on("mouse:up", function (e) {
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
		else if (isPickingPL && linePoints.length < 2) {
			if (cancelOp){
				cancelOp = false;
				// 取消操作
			}
			else {
				// 加入
				let p = canvas.getPointer(e.e);
				addPLEndpoint(p.x, p.y);
				if (linePoints.length==2){
					lines.push(linePoints);
					linePoints=[];
				}               
			}
			isPickingPL = false;
			tips.innerHTML = '';
			setCanvasCursor('grab');
		} 

		else if (movable && canvas.getActiveObject() == undefined) {
			this.panning = false;
			canvas.selection = true;
			setCanvasCursor('grab');
		}
	});

	canvas.on("mouse:move", function (e) {
		// 选择天体
		if (isPickingCele) {
			if (lmbDown) {
				cancelOp = true;
				canvas.selection = false;
				tips.innerHTML = '松开鼠标取消标记。';
				setCanvasCursor('not-allowed');
				return;
			}
			setCanvasCursor('crosshair');
		}

		// 选择铅垂线
		else if (isPickingPL) {
			if (lmbDown) {
				cancelOp = true;
				canvas.selection = false;
				tips.innerHTML = '松开鼠标取消标记。';
				setCanvasCursor('not-allowed');
				return;
			}
			setCanvasCursor('crosshair');                 
		}

		// 坐标显示
		if (movable && e && !this.panning) {
			let p = canvas.getPointer(e.e);
			cursorCrd.innerHTML = `${Math.round(p.x)}，${Math.round(p.y)}`;
		}
		if (this.panning && e && e.e) {
			var delta = new fabric.Point(e.e.movementX, e.e.movementY);
			canvas.relativePan(delta);
		}
	});

	// 鼠标移出画布时清空坐标
	canvas.on('mouse:out', function (e) {
		if (movable && e) {
			let p = canvas.getPointer(e.e);
			cursorCrd.innerHTML = '';
		}
	})

	// 用鼠标滚轮控制画布缩放
	canvas.on('mouse:wheel', opt => {
		if (!movable) return;
		opt.e.preventDefault()
		const delta = opt.e.deltaY
		let zoom = this.canvas.getZoom()
		zoom *= 0.999 ** delta
		if (zoom > 20) zoom = 20
		if (zoom < 0.01) zoom = 0.1
		this.canvas.zoomToPoint({
			x: opt.e.offsetX,
			y: opt.e.offsetY
		},
			zoom
		)
	})

	// 调整画布的缩放和视图位置
	function reZoomCanvas(rect, alignRect = false, resize = true) {
		var scaleX = canvas.width / rect.width;
		var scaleY = canvas.height / rect.height;
		var scale = Math.min(scaleX, scaleY);
		var newX = canvas.width / 2 - rect.width / 2, newY = canvas.height / 2 - rect.height / 2
		if (alignRect)
			canvas.setViewportTransform([1, 0, 0, 1, newX, newY]);
		else canvas.setViewportTransform([1, 0, 0, 1, canvas.width / 2, canvas.height / 2]);
		if (resize)
			canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, scale);
	}

	// 页面改变大小事件
	window.onresize = function () {
		canvas.setWidth(container.clientWidth);
		canvas.setHeight(container.clientHeight);
		if (movable) reZoomCanvas(rect);
		else reZoomCanvas(text, true, false);
	}

	//--------------------事件绑定--------------------
	// 重置缩放事件
	document.getElementById('resetZoom').addEventListener('click', function () {
		if (movable) reZoomCanvas(rect);
	});
	// 选择天体事件
	document.getElementById('celePick').addEventListener('click', function () {
		if (!movable) return;
		isPickingCele = !isPickingCele;
		tips.innerHTML = `${isPickingCele ? '单击要选择的天体。' : ''}`;
	});
	// 选择铅垂线事件
	document.getElementById('vaniZen').addEventListener('click', function () {
		if (!movable) return;
		isPickingPL = !isPickingPL;
		tips.innerHTML = `${isPickingPL ? '请依次点击要选择的铅垂线的两个端点。' : ''}`;
	});
	//--------------------------------------------

	// 读取到文件事件
	function onImgChange(e) {
		let file = e.target.files[0];
		let reader = new FileReader();
		reader.onload = function (e) {
			let img = new Image();
			img.onload = function () {
				let width = img.width, height = img.height;
				// 移除先前图片
				if (rect != undefined)
					canvas.remove(rect);
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
	document.getElementById("srcFile").addEventListener('change', onImgChange);

	// 初始化地图
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
	// leafletLink.getElementsByTagName('svg')[0]

	//L.marker([28.7684, 120.8347]).addTo(map); //标点

	// 加载边境线GeoJSON数据
	fetch('leaflet/dist/CNP.json')
		.then(response => {
			if (!response.ok) {
				throw new Error('网络响应不是正常的状态');
			}
			return response.json();
		})
		.then(data => {
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

	let width = 32, height = 32;
	let point = new fabric.Path('M15 0 16 16 17 0ZM0 15 16 16 0 17ZM15 32 16 16 17 32ZM32 17 16 16 32 15Z', {
		left: x - 16,
		top: y - 16,
		width: width,
		height: height,
		fill: '#FFD248',
		hasControls: false,
		id: numOfPts // 标记其索引
	});
	let text = new fabric.Text('xxx', {
		left: x + 16,
		top: y - 10,
		fontSize: 16,
		fontFamily: '微软雅黑',
		fill: '#FFD248',
		selectable: false,
		hoverCursor: 'grab'
	});
	point.on("moving", e => {
		text.left = point.left + 32, text.top = point.top + 6;
		text.setCoords();
		// 修改表格内容（貌似性能不是很好）
		document.getElementById(`coordX${point.id}`).value = Math.round((point.left + 16) * 100) / 100;
		document.getElementById(`coordY${point.id}`).value = Math.round((point.top + 16) * 100) / 100;
	});
	canvas.add(point);
	canvas.add(text);

	points.push(point);
	ptLabels.push(text);

	// 加入到表格中
	document.getElementById(`coordX${numOfPts}`).value = x;
	document.getElementById(`coordY${numOfPts}`).value = y;
}

// 添加铅垂线端点的函数
function addPLEndpoint(x, y){
	// 保留两位小数
	x = Math.round(x * 100) / 100;
	y = Math.round(y * 100) / 100;

	numLinePoint++;
	numLine=parseInt(numLinePoint/2);

	let width = 32, height = 32;
	let point = new fabric.Path('M15 0 16 16 17 0ZM0 15 16 16 0 17ZM15 32 16 16 17 32ZM32 17 16 16 32 15Z', {
		left: x - 16,
		top: y - 16,
		width: width,
		height: height,
		fill: '#1919E6',
		hasControls: false,
		id: numLinePoint // 标记其索引
	});
	let text = new fabric.Text('>>>', {
		left: x + 16,
		top: y - 10,
		fontSize: 16,
		fontFamily: '微软雅黑',
		fill: '#1919E6',
		selectable: false,
		hoverCursor: 'grab'
	});
	point.on("moving", e => {
		text.left = point.left + 32, text.top = point.top + 6;
		text.setCoords();
	});
	canvas.add(point);
	canvas.add(text);

	linePoints.push(point);
	lineLabels.push(text);
}
/* const input = document.getElementById('hAngle1');
const floatingDiv = document.getElementById('hourAngleInput');

input.addEventListener('focus', function () {
const rect = input.getBoundingClientRect(); // 获取 input 的位置
floatingDiv.style.display = 'block'; // 显示浮动 div
floatingDiv.style.top = `${rect.bottom + window.scrollY}px`; // 设置浮动 div 的顶部位置
floatingDiv.style.left = `${rect.left + window.scrollX}px`; // 设置浮动 div 的左侧位置
});

input.addEventListener('blur', function () {
floatingDiv.style.display = 'none'; // 隐藏浮动 div
}); */