import { DefaultbuttonFunctioner } from './Default.js';
import { BACKEND_API } from '../../config.js';
import { getOriginalStars, getGlobalPLPointsCoord, post } from '../utils.js';

// 计算地理位置按钮功能类
class Calc extends DefaultbuttonFunctioner {
    constructor(interactPhoto, celeCoord) {
        super(interactPhoto);
        this.celeCoord = celeCoord;
        this.geojson = null;
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        let isAutoCeleCoord = document.getElementById('check3').checked; // 是否自动计算天体坐标
        if (!this.validateBeforeCalculate(isAutoCeleCoord)) return;

        if (isAutoCeleCoord) {
            // 先计算天体坐标
            this.celeCoord.calc().then((code) => {
                // 如果天体坐标计算成功，再计算地理位置
                if (code == 0) {
                    this.calc();
                }
            });
        } else {
            this.calc();
        }
    }

    validateBeforeCalculate(isAutoCeleCoord) {
        let originalStars = getOriginalStars(this.interactPhoto);

        if (originalStars.length < 3) {
            this.interactPhoto.tips.innerHTML = `请至少选择三颗星`;
            return false;
        }
        if (!this.checkStarPositions(originalStars)) {
            this.interactPhoto.tips.innerHTML = `请完整填写星星像素坐标`;
            return false;
        }
        if (this.interactPhoto.getCompletePLCount() < 2) {
            this.interactPhoto.tips.innerHTML = `请至少选择两条完整铅垂线`;
            return false;
        }
        if (isAutoCeleCoord) {
            if (!this.checkStarNames(originalStars)) {
                this.interactPhoto.tips.innerHTML = `请填写所有天体名称`;
                return false;
            }
            return true;
        }
        if (!this.checkStars(originalStars)) {
            this.interactPhoto.tips.innerHTML = `请完整填写星星数据`;
            return false;
        }
        return true;
    }

    // 重置标注数据
    clearData() {
        document.getElementById('zenX').value = '';
        document.getElementById('zenY').value = '';
        this.hideGeojson();
    }

    // 计算地理位置
    calc() {
        // 读取数据
        let globalPLsPointsCoord = getGlobalPLPointsCoord(this.interactPhoto).filter((line) => line.length === 2);
        let originalStars = getOriginalStars(this.interactPhoto);

        // 检查数据
        if (!this.checkStars(originalStars)) {
            this.interactPhoto.tips.innerHTML = `请完整填写星星数据`;
            return;
        } else if (globalPLsPointsCoord.length < 2) {
            this.interactPhoto.tips.innerHTML = `请至少选择两条完整铅垂线`;
            return;
        }

        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;
        this.hideGeojson();

        post(
            `${BACKEND_API}/positioning`,
            {
                photo: {
                    stars: originalStars,
                    lines: globalPLsPointsCoord,
                },
                isFixRefraction: document.getElementById('check1').checked,
                isFixGravity: document.getElementById('check2').checked,
            },
            'json'
        ).then(([results, detail]) => {
            if (detail === 'success') {
                // 显示结果
                this.addZenithtoTable(results['topPoint']);
                this.showZ(results['z']);
                this.showGeoEstimate(results['lon'], results['lat']);
                this.showGeojson(results['geojson']);
                this.interactPhoto.tips.innerHTML = '计算地理位置成功';
            } else {
                this.hideGeojson();
                this.interactPhoto.tips.innerHTML = `计算地理位置失败：${detail}`;
            }
        });

        // 结束计算
        this.interactPhoto.resetbuttonFunctioner();
    }

    // 检查originalStars数组每个子项的数据是否完整
    checkStars(originalStars) {
        return (
            this.checkStarNames(originalStars) &&
            this.checkStarPositions(originalStars) &&
            this.checkStarCoords(originalStars)
        );
    }

    checkStarNames(originalStars) {
        return originalStars.every((originalStar) => originalStar.name.trim() !== '');
    }

    checkStarPositions(originalStars) {
        return originalStars.every(
            (originalStar) => Number.isFinite(originalStar.x) && Number.isFinite(originalStar.y)
        );
    }

    checkStarCoords(originalStars) {
        return originalStars.every(
            (originalStar) => Number.isFinite(originalStar.lon) && Number.isFinite(originalStar.lat)
        );
    }

    // 添加天顶坐标到表格
    addZenithtoTable(zenith) {
        document.getElementById('zenX').value = Math.round(zenith[0] * 100) / 100;
        document.getElementById('zenY').value = Math.round(zenith[1] * 100) / 100;
    }

    // 显示焦距
    showZ(z) {
        document.getElementById('focLenPix').textContent = Math.round(z * 1000) / 1000;
        let width = this.interactPhoto.img.width;
        let height = this.interactPhoto.img.height;
        let tri_long = Math.sqrt(width * width + height * height);
        let z35 = (z * 43.27) / tri_long;
        document.getElementById('focLenMm').textContent = Math.round(z35);
    }

    // 显示地理坐标
    showGeoEstimate(geoLon, geoLat) {
        // 转换单位
        geoLon = (geoLon * 180) / Math.PI;
        geoLat = (geoLat * 180) / Math.PI;
        geoLon = this.wrapAngleInDeg(geoLon);
        document.getElementById('outputLat').textContent = Math.round(geoLat * 10000) / 10000 + '°';
        document.getElementById('outputLong').textContent = Math.round(geoLon * 10000) / 10000 + '°';
    }

    showGeojson(geojson) {
        const geojsonPanel = document.getElementById('geojsonPanel');
        const geojsonIoLink = document.getElementById('openGeojsonIo');
        const openAmapButton = document.getElementById('openAmap');

        if (!geojson) {
            this.hideGeojson();
            return;
        }

        this.geojson = geojson;
        const geojsonText = JSON.stringify(geojson, null, 2);
        geojsonPanel.hidden = false;
        geojsonIoLink.href = `https://geojson.io/#data=data:application/json,${encodeURIComponent(geojsonText)}`;
        openAmapButton.onclick = () => this.openAmap();
    }

    hideGeojson() {
        const geojsonPanel = document.getElementById('geojsonPanel');
        const geojsonIoLink = document.getElementById('openGeojsonIo');
        const openAmapButton = document.getElementById('openAmap');

        this.geojson = null;
        if (geojsonPanel) geojsonPanel.hidden = true;
        if (geojsonIoLink) geojsonIoLink.href = 'https://geojson.io/';
        if (openAmapButton) openAmapButton.onclick = null;
    }

    openAmap() {
        if (!this.geojson) return;

        const mapWindow = window.open('', '_blank');
        if (!mapWindow) {
            this.interactPhoto.tips.innerHTML = '浏览器阻止了弹出窗口，请允许后重试';
            return;
        }

        mapWindow.document.open();
        mapWindow.document.write(this.buildAmapHtml(this.geojson));
        mapWindow.document.close();
    }

    buildAmapHtml(geojson) {
        const geojsonText = JSON.stringify(geojson).replace(/</g, '\\u003c');

        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
    <title>GeoJSON 点位展示</title>
    <style>
        html, body, #container {
            width: 100%;
            height: 100%;
            margin: 0;
        }
    </style>
    <script>
        window._AMapSecurityConfig = {
            securityJsCode: '290ddc4b0d33be7bc9b354bc6a4ca614',
        };
    </script>
    <script src="https://webapi.amap.com/maps?v=2.0&key=6f025e700cbacbb0bb866712d20bb35c&plugin=AMap.GeoJSON"></script>
</head>
<body>
<div id="container"></div>
<script>
    var map = new AMap.Map('container', {
        zoom: 15
    });

    var geojsonData = ${geojsonText};
    var geojson = new AMap.GeoJSON({
        geoJSON: geojsonData,
        getMarker: function(feature, lnglat) {
            var properties = feature.properties || {};
            return new AMap.Marker({
                position: lnglat,
                content: '<div style="background-color: #f00; width: 12px; height: 12px; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 5px #000;"></div>',
                offset: new AMap.Pixel(-8, -8),
                label: {
                    content: properties.name || '定位结果',
                    direction: 'top'
                }
            });
        },
        getPolyline: function(feature, lnglats) {
            return new AMap.Polyline({
                path: lnglats,
                strokeColor: '#ff0000',
                strokeWeight: 3,
                strokeOpacity: 0.75,
                strokeStyle: 'dashed'
            });
        }
    });

    map.add(geojson);
    map.setFitView();
</script>
</body>
</html>`;
    }

    /**
     * 使得角度位于 [-180,180]
     * @param {number} deg
     * @returns {number}
     */
    wrapAngleInDeg(deg) {
        while (deg > 180) {
            deg -= 360;
        }
        while (deg < -180) {
            deg += 360;
        }
        return deg;
    }
}

export { Calc };
