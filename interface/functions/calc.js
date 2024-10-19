import { DefaultButtonFonctioner } from './default.js';
import { getVPoint } from '../../core/algorithm/VPoint.js'
import { getZ } from '../../core/getZ.js';
import { calc } from '../../core/calc.js';
import { markStars } from '../../core/mark.js';


// 选择天体按钮功能类
class Calc extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
        this.mapMarker = null;
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;
        
        // 读取数据
        let globalPLsPointsCoord = this.interactPhoto.globalPLPointsCoord;
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
        this.interactPhoto.buttonFonctioner = this;
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

            // 结束计算
            this.interactPhoto.tips.innerHTML = '';
        } catch (e) {
            this.interactPhoto.tips.innerHTML = `计算失败：${e.message}，请检查数据`;
        } finally {
            this.interactPhoto.resetButtonFonctioner();
        }
    }

    // 添加天顶坐标到表格
    addZenithtoTable(zenith){
        document.getElementById('zenX').value = Math.round(zenith[0] * 100) / 100;
        document.getElementById('zenY').value = Math.round(zenith[1] * 100) / 100;
    }

    // 获取原始星星数据
    getOriginalStars(){
        let stars = [];
        for(let i = 1; i <= this.interactPhoto.numOfPts; i++){
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
        document.getElementById('outputLong').textContent = Math.round(geoEstimate[0] * 10000) / 10000 + "°";
        document.getElementById('outputLat').textContent = Math.round(geoEstimate[1] * 10000 ) / 10000 + "°";
        let map = this.interactPhoto.map;
        // 清除之前的标记
        if(this.mapMarker){
            map.removeLayer(this.mapMarker);
        }
        // 添加新的标记
        let marker = L.marker([geoEstimate[0], geoEstimate[1]]).addTo(map);
        this.mapMarker = marker;
        map.setView([geoEstimate[0], geoEstimate[1]], 3);
    }
}


export { Calc };