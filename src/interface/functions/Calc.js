import { marker } from 'leaflet';
import { polyline } from 'leaflet';
import { DefaultbuttonFunctioner } from './Default.js';
import { getVPoint } from '../../core/algorithm/VPoint.js'
import { getZ } from '../../core/getZ.js';
import { calc } from '../../core/calc.js';
import { markStars } from '../../core/mark.js';
import { getOriginalStars, getGlobalPLPointsCoord } from '../utils.js';


// 选择天体按钮功能类
class Calc extends DefaultbuttonFunctioner {
    constructor(interactPhoto) {
        super(interactPhoto);
        this.mapMarker = null;
        this.mapLine = null;
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        // 读取数据
        let globalPLsPointsCoord = getGlobalPLPointsCoord();
        let originalStars = getOriginalStars();

        // 检查数据
        if (globalPLsPointsCoord.length < 2) {
            this.interactPhoto.tips.innerHTML = `请至少选择两条铅垂线`;
            return;
        } else if (originalStars.length < 3) {
            this.interactPhoto.tips.innerHTML = `请至少选择三颗星`;
            return;
        }

        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;

        try {
            // 计算灭点
            let zenith = getVPoint(globalPLsPointsCoord);
            this.addZenithtoTable(zenith);

            // 计算焦距
            let stars = markStars(originalStars);
            let isFixRefraction = document.getElementById('check1').checked;
            let z = getZ(stars, zenith, isFixRefraction);
            if (isNaN(z)) {
                throw new Error("无法计算像素焦距");
            }
            this.showZ(z);

            // 计算地理坐标
            let isFixGravity = document.getElementById('check2').checked;
            let geoEstimate = calc(stars, z, zenith, isFixGravity, isFixRefraction);
            if (geoEstimate.length == 0 || isNaN(geoEstimate[0]) || isNaN(geoEstimate[1])) {
                throw new Error("无法计算地理坐标");
            }

            // 显示结果
            this.showGeoEstimate(geoEstimate);
            this.show35mmZ(z);

            // 结束计算
            this.interactPhoto.tips.innerHTML = '';
        } catch (e) {
            this.interactPhoto.tips.innerHTML = `计算失败：${e.message}，请检查数据`;
        } finally {
            this.interactPhoto.resetbuttonFunctioner();
        }
    }

    // 添加天顶坐标到表格
    addZenithtoTable(zenith) {
        document.getElementById('zenX').value = Math.round(zenith[0] * 100) / 100;
        document.getElementById('zenY').value = Math.round(zenith[1] * 100) / 100;
    }

    // 显示焦距
    showZ(z) {
        document.getElementById('focLenPix').textContent = Math.round(z * 1000) / 1000;
    }

    // 显示地理坐标
    showGeoEstimate(geoEstimate) {
        if (geoEstimate[1] > 180) {
            geoEstimate[1] -= 360;
        }
        document.getElementById('outputLat').textContent = Math.round(geoEstimate[0] * 10000) / 10000 + "°";
        document.getElementById('outputLong').textContent = Math.round(geoEstimate[1] * 10000) / 10000 + "°";
        let map = this.interactPhoto.map;
        // 清除之前的标记
        if (this.mapMarker) {
            map.removeLayer(this.mapMarker);
        }
        if (this.mapLine) {
            map.removeLayer(this.mapLine);
        }
        // 先申请国内
        let addressDiv = document.getElementById('address');
        fetch(
            `https://geocode.xyz/${geoEstimate[0]},${geoEstimate[1]}?json=1`,
            { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (!data.geocode.startsWith('Throttled')) {
                    function info2str(info) {
                        return (typeof info == 'string') ? (info + ", ") : '';
                    }
                    let address = `${info2str(data.staddress) + info2str(data.city) + info2str(data.region) + info2str(data.state) + info2str(data.country)}`;
                    addressDiv.innerText = address.slice(0, -2);
                } else {
                    // OSM逆地址解析API（镜像）
                    fetch(
                        `https://map.mapscdn.com/nominatim/reverse?format=json&lat=${geoEstimate[0]}&lon=${geoEstimate[1]}&zoom=18&addressdetails=0`,
                        { method: 'GET' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.display_name != undefined)
                                addressDiv.innerText = data.display_name;
                            else {
                                // 原API（需梯子）
                                fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoEstimate[0]}&lon=${geoEstimate[1]}&zoom=18&addressdetails=0`,
                                    { method: 'GET' })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.display_name != undefined)
                                            addressDiv.innerText = data.display_name;
                                    });
                            }
                        });
                }
            });
        // 添加新的标记
        let newMarker = marker([geoEstimate[0], geoEstimate[1]]).addTo(map);
        this.mapMarker = newMarker;
        // 误差线
        let shift = 0.125; // TODO: 从界面读取误差值
        this.mapLine = polyline([[geoEstimate[0], ((geoEstimate[1] - shift + 180) % 360 + 360) % 360 - 180],
                                 [geoEstimate[0], ((geoEstimate[1] + shift + 180) % 360 + 360) % 360 - 180]],
                                 { color: '#4996d2' }).addTo(map);
        map.setView([geoEstimate[0], geoEstimate[1]], 3);
    }

    // 显示35mm等效焦距
    show35mmZ(z) {
        let width = this.interactPhoto.img.width;
        let height = this.interactPhoto.img.height;
        let tri_long = Math.sqrt(width * width + height * height);
        let z35 = z * 43.27 / tri_long;
        document.getElementById('focLenMm').textContent = Math.round(z35);
    }
}


export { Calc };