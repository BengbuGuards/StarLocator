// by BengbuGuards小流汗黄豆
var container
var canvas
var cursor_crd
var movable = false, isDrawing = false;
var text
var rect
var map

// 页面加载完成事件
window.onload = function () {
	container = document.getElementById('box');
	cursor_crd = document.getElementById('cursor-crd');

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
	reZoomCanvas(text, false);

	// 画布缩放移动
	canvas.on("mouse:down", function (e) {
		if (movable && canvas.getActiveObject() == undefined) {
			this.panning = true;
			canvas.selection = false;
		}
	});
	canvas.on("mouse:up", function (e) {
		if (movable && canvas.getActiveObject() == undefined) {
			this.panning = false;
			canvas.selection = true;
		}
	});
	canvas.on("mouse:move", function (e) {
		// 坐标显示
		if (movable && e) {
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
		if (!movable) return
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

	function reZoomCanvas(rect, resize = true) {
		var scaleX = canvas.width / rect.width;
		var scaleY = canvas.height / rect.height;
		var scale = Math.min(scaleX, scaleY);
		var newX = canvas.width / 2 - rect.width / 2, newY = canvas.height / 2 - rect.height / 2
		canvas.setViewportTransform([1, 0, 0, 1, newX, newY]);
		if (resize)
			canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, scale);
	}

	// 页面改变大小事件
	window.onresize = function () {
		canvas.setWidth(container.clientWidth);
		canvas.setHeight(container.clientHeight);
		if (movable) reZoomCanvas(rect);
		else reZoomCanvas(text, false);
	}

	// 读取到文件事件
	function onImgChange(e) {
		var file = e.target.files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			var img = new Image();
			img.onload = function () {
				// 移除先前图片
				if (rect != undefined)
					canvas.remove(rect);
				// 创建图片Rect
				var pattern = new fabric.Pattern({
					source: img,
					repeat: 'repeat'
				});
				rect = new fabric.Rect({
					width: img.width,
					height: img.height,
					fill: pattern,
					selectable: false,
					hoverCursor: 'default'
				});
				canvas.add(rect);
				// 更新页面
				document.getElementById('pic-info').innerHTML = `${img.width} × ${img.height}`;
				reZoomCanvas(rect);
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
		movable = true;
		canvas.selection = true;
		canvas.remove(text);
	}
	document.getElementById("srcFile").addEventListener('change', onImgChange);

	// 初始化地图
	map = L.map('map').setView([32.0, 110.0], 3);

	L.tileLayer('https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		maxZoom: 19,
		subdomains: ['services', 'server'],
		attribution: '&copy; <a href="https://wiki.openstreetmap.org/wiki/Esri">ArcGIS: Esri World Imagery</a>'
	}).addTo(map);

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