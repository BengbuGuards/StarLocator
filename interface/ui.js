// by BengbuGuards小流汗黄豆
var container, canvas, canvasInst, tips, cursor_crd;
var movable = false;
var text, rect;
var map;

var lmbDown = false, cancelOp = false;
var isPickingCele = false;

// 页面加载完成事件
window.onload = function () {
	container = document.getElementById('box');
	cursor_crd = document.getElementById('cursorCrd');
	tips = document.getElementById('canvasStatus');

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
		if (!isPickingCele && movable && canvas.getActiveObject() == undefined) {
			if (!this.panning) {
				setCanvasCursor('grabbing');
			}
			this.panning = true;
			canvas.selection = false;
		}
	});
	canvas.on("mouse:up", function (e) {
		lmbDown = false;
		if (isPickingCele) {
			if (cancelOp) {
				cancelOp = false;
				// 取消操作
			}else{
				// 加入
			}
			isPickingCele = false;
			tips.innerHTML = '';
			setCanvasCursor('grab');
		} else if (movable && canvas.getActiveObject() == undefined) {
			this.panning = false;
			canvas.selection = true;
			setCanvasCursor('grab');
		}
	});
	canvas.on("mouse:move", function (e) {
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
		// 坐标显示
		if (movable && e && !this.panning) {
			let p = canvas.getPointer(e.e);
			cursor_crd.innerHTML = `${Math.round(p.x)}，${Math.round(p.y)}`;
		}
		if (this.panning && e && e.e) {
			var delta = new fabric.Point(e.e.movementX, e.e.movementY);
			canvas.relativePan(delta);
		}
	});
	canvas.on('mouse:out', function (e) {
		if (movable && e) {
			let p = canvas.getPointer(e.e);
			cursor_crd.innerHTML = '';
		}
	})
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

	document.getElementById('resetZoom').addEventListener('click', function () {
		if (movable) reZoomCanvas(rect);
	});
	document.getElementById('celePick').addEventListener('click', function () {
		if (!movable) return;
		isPickingCele = !isPickingCele;
		tips.innerHTML = `${isPickingCele ? '单击要选择的天体。' : ''}`;
	});

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

	var leafletLink = document.getElementsByClassName('leaflet-control-attribution leaflet-control')[0].getElementsByTagName('a')[0];
	leafletLink.title = '一个交互式地图 JavaScript 库';
	leafletLink.getElementsByTagName('svg')[0].remove();

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