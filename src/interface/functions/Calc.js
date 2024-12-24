import { marker } from 'leaflet';
import { polyline } from 'leaflet';
import { DefaultbuttonFunctioner } from './Default.js';
import { BACKEND_API } from '../../config.js';
import { getOriginalStars, getGlobalPLPointsCoord, postJSON } from '../utils.js';

// 计算地理位置按钮功能类
class Calc extends DefaultbuttonFunctioner {
    constructor(interactPhoto, celeCoord) {
        super(interactPhoto);
        this.celeCoord = celeCoord;
        this.mapMarker = null;
        this.mapLine = null;
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        let isAutoCeleCoord = document.getElementById('check3').checked; // 是否自动计算天体坐标
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

    // 重置标注数据
    clearData() {
        document.getElementById('zenX').value = '';
        document.getElementById('zenY').value = '';
    }

    // 计算地理位置
    calc() {
        // 读取数据
        let globalPLsPointsCoord = getGlobalPLPointsCoord(this.interactPhoto);
        let originalStars = getOriginalStars(this.interactPhoto);

        // 检查数据
        if (originalStars.length < 3) {
            this.interactPhoto.tips.innerHTML = `请至少选择三颗星`;
            return;
        } else if (!this.checkStars(originalStars)) {
            this.interactPhoto.tips.innerHTML = `请完整填写星星数据`;
            return;
        } else if (globalPLsPointsCoord.length < 2) {
            this.interactPhoto.tips.innerHTML = `请至少选择两条铅垂线`;
            return;
        }

        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;

        postJSON(`${BACKEND_API}/positioning`, {
            photo: {
                stars: originalStars,
                lines: globalPLsPointsCoord,
            },
            isFixRefraction: document.getElementById('check1').checked,
            isFixGravity: document.getElementById('check2').checked,
        }).then(([results, detail]) => {
            if (detail === 'success') {
                // 显示结果
                this.addZenithtoTable(results['topPoint']);
                this.showZ(results['z']);
                this.showGeoEstimate(results['lon'], results['lat']);
                this.interactPhoto.tips.innerHTML = '计算地理位置成功';
            } else {
                this.interactPhoto.tips.innerHTML = `计算地理位置失败：${detail}`;
            }
        });

        // 结束计算
        this.interactPhoto.resetbuttonFunctioner();
    }

    // 检查originalStars数组每个子项的数据是否完整
    checkStars(originalStars) {
        let isComplete = true;
        originalStars.forEach((originalStar) => {
            Object.values(originalStar).forEach((data) => {
                if (!data) {
                    isComplete = false;
                }
            });
        });
        return isComplete;
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
        // 在地图上显示位置
        geoLon = this.wrapAngleInDeg(geoLon);

        document.getElementById('outputLat').textContent = Math.round(geoLat * 10000) / 10000 + '°';
        document.getElementById('outputLong').textContent = Math.round(geoLon * 10000) / 10000 + '°';
        let map = this.interactPhoto.map;
        // 清除之前的标记
        if (this.mapMarker) {
            map.removeLayer(this.mapMarker);
        }
        if (this.mapLine) {
            map.removeLayer(this.mapLine);
        }
        // 逆地址解析
        let addressDiv = document.getElementById('address');
        addressDiv.innerText = '正在获取地理位置信息...';
        // 先申请国内
        fetch(`https://geocode.xyz/${geoLat},${geoLon}?json=1`, { method: 'GET' })
            .then((response) => response.json())
            .then((data) => {
                if (!data.geocode.startsWith('Throttled')) {
                    function info2str(info) {
                        return typeof info == 'string' ? info + ', ' : '';
                    }
                    let address = `${info2str(data.staddress) + info2str(data.city) + info2str(data.region) + info2str(data.state) + info2str(data.country)}`;
                    addressDiv.innerText = address.slice(0, -2);
                } else {
                    // OSM逆地址解析API（镜像）
                    fetch(
                        `https://map.mapscdn.com/nominatim/reverse?format=json&lat=${geoLat}&lon=${geoLon}&zoom=18&addressdetails=0`,
                        { method: 'GET' }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.display_name != undefined) addressDiv.innerText = data.display_name;
                            else {
                                // 原API（需梯子）
                                fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoLat}&lon=${geoLon}&zoom=18&addressdetails=0`,
                                    { method: 'GET' }
                                )
                                    .then((response) => response.json())
                                    .then((data) => {
                                        if (data.display_name != undefined) addressDiv.innerText = data.display_name;
                                    });
                            }
                        });
                }
            })
            .catch(() => {
                addressDiv.innerText = '获取地理位置信息失败';
            });
        // 添加新的标记
        let newMarker = marker([geoLat, geoLon]).addTo(map);
        this.mapMarker = newMarker;
        // 误差线
        let shift = 0.125; // TODO: 从界面读取误差值
        this.mapLine = polyline(
            [
                [geoLat, ((((geoLon - shift + 180) % 360) + 360) % 360) - 180],
                [geoLat, ((((geoLon + shift + 180) % 360) + 360) % 360) - 180],
            ],
            { color: '#4996d2' }
        ).addTo(map);
        map.setView([geoLat, geoLon], 3);
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
