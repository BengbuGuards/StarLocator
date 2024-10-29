import { DefaultbuttonFunctioner } from './Default.js';
import { getVPoint } from '../../core/algorithm/VPoint.js'
import { getZ } from '../../core/getZ.js';
import { calc } from '../../core/calc.js';
import { markStars } from '../../core/mark.js';


// 选择天体按钮功能类
class Calc extends DefaultbuttonFunctioner{
    constructor(interactPhoto){
        super(interactPhoto);
        this.mapMarker = null;
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;
        
        // 读取数据
        let globalPLsPointsCoord = this.getGlobalPLPointsCoord();
        let originalStars = this.getOriginalStars();
        
        // 检查数据
        if(globalPLsPointsCoord.length<2){
            this.interactPhoto.tips.innerHTML = `请至少选择两条铅垂线`;
            return;
        } else if(originalStars.length<3){
            this.interactPhoto.tips.innerHTML = `请至少选择三颗星`;
            return;
        }
        
        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;
        
        try {
            // 计算灭点，注意检查数量
            let zenith = getVPoint(globalPLsPointsCoord);
            this.addZenithtoTable(zenith);
            
            // 计算焦距
            let stars = markStars(originalStars);
            let isFixRefraction = document.getElementById('check1').checked;
            let z = getZ(stars, zenith, isFixRefraction);
            if(isNaN(z)){
                throw new Error("无法计算像素焦距");
            }
            this.showZ(z);

            // 计算地理坐标
            let isFixGravity = document.getElementById('check2').checked;
            let geoEstimate = calc(stars, z, zenith, isFixGravity, isFixRefraction);
            if(geoEstimate.length==0 || isNaN(geoEstimate[0]) || isNaN(geoEstimate[1])){
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
    addZenithtoTable(zenith){
        document.getElementById('zenX').value = Math.round(zenith[0] * 100) / 100;
        document.getElementById('zenY').value = Math.round(zenith[1] * 100) / 100;
    }

    // 获取铅垂线端点坐标
    getGlobalPLPointsCoord(){
        let globalPLPointsCoord = [];
        for(let i = 0; i < this.interactPhoto.PLArray.num(); i++){
            let pl = this.interactPhoto.PLArray.array[i];
            let points = [];
            for(let j = 0; j < pl.points.length; j++){
                points.push(pl.points[j].coordinate);
            }
            globalPLPointsCoord.push(points);
        }
        return globalPLPointsCoord;
    }

    // 获取原始星星数据
    getOriginalStars(){
        let stars = [];
        for(let i = 1; i <= this.interactPhoto.CeleArray.num(); i++){
            let star = [
                parseFloat(document.getElementById(`coordX${i}`).value),
                parseFloat(document.getElementById(`coordY${i}`).value),
                document.getElementById(`name${i}`).textContent,
                document.getElementById(`hAngleH${i}`).textContent + 'h' +
                document.getElementById(`hAngleM${i}`).textContent + 'm' +
                document.getElementById(`hAngleS${i}`).textContent + 's',
                document.getElementById(`declinD${i}`).textContent + '°' +
                document.getElementById(`declinM${i}`).textContent + '\'' +
                document.getElementById(`declinS${i}`).textContent + '"'
            ];
            if(star[0] && star[1] && star[2] && star[3] && star[4]){
                stars.push(star);
            }
        }
        return stars;
    }

    // 显示焦距
    showZ(z){
        document.getElementById('focLenPix').textContent = Math.round(z * 1000) / 1000;
    }

    // 显示地理坐标
    showGeoEstimate(geoEstimate){
        if (geoEstimate[1] > 180) {
            geoEstimate[1] -= 360;
        }
        document.getElementById('outputLat').textContent = Math.round(geoEstimate[0] * 10000) / 10000 + "°";
        document.getElementById('outputLong').textContent = Math.round(geoEstimate[1] * 10000 ) / 10000 + "°";
        let map = this.interactPhoto.map;
        // 清除之前的标记
        if(this.mapMarker){
            map.removeLayer(this.mapMarker);
        }
        // 先申请国内
        let addressDiv = document.getElementById('address');
        fetch(
            `https://geocode.xyz/${geoEstimate[0]},${geoEstimate[1]}?json=1`,
            {method: 'GET'})
        .then(response => response.json())
        .then(data => {
            if(!data.geocode.startsWith('Throttled')){
                function info2str(info){
                    return (typeof info == 'string') ? (info + ", ") : '';
                }
                let address = `${info2str(data.staddress)+info2str(data.city)+info2str(data.region)+info2str(data.state)+info2str(data.country)}`;
                addressDiv.innerText = address.slice(0, -2);
            }else{
                // 申请国外（此处为镜像，原域名附右）https://nominatim.openstreetmap.org/
                fetch(
                    `https://map.mapscdn.com/nominatim/reverse?format=json&lat=${geoEstimate[0]}&lon=${geoEstimate[1]}&zoom=18&addressdetails=0`,
                    {method: 'GET'})
                .then(response => response.json())
                .then(data => {
                    if(data.display_name != undefined)
                        addressDiv.innerText = data.display_name;
                })
                .catch(error => {});
            }
        })
        .catch(error => {}); // 捕获错误
        // 添加新的标记
        let marker = L.marker([geoEstimate[0], geoEstimate[1]]).addTo(map);
        this.mapMarker = marker;
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