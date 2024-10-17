import { DefaultButtonFonctioner } from './default.js';
import { getVPoint } from '../../core/algorithm/VPoint.js'
import { getZ } from '../../core/getZ.js';
import { calc } from '../../core/calc.js';


// 选择天体按钮功能类
class Calc extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
    }

    onClick() {
        super.onClick();
        
        // 读取数据
        let globalPLs = this.getPLsCorrd(this.interactPhoto.globalPLs);
        let stars = this.getOriginalStars();

        // 检查数据
        if(globalPLs.length<2){
            this.interactPhoto.tips.innerHTML = `请至少选择两条铅垂线`;
            return;
        } else if(stars.length<3){
            this.interactPhoto.tips.innerHTML = `请至少选择三颗星`;
            return;
        }

        // 开始计算
        this.interactPhoto.buttonFonctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;

        // 计算灭点，注意检查数量
        let zenith = getVPoint(globalPLs);
        this.addZenithtoTable(zenith);

        // 计算焦距
        let z = getZ(stars, zenith, true); 

        // 计算地理坐标
        let geoEstimate = calc(stars, z, zenith, true, true);

        // 显示结果
        this.showGeoEstimate(geoEstimate);
        
        // 结束计算
        this.interactPhoto.tips.innerHTML = '';
        this.interactPhoto.resetButtonFonctioner();
    }

    // 获取铅垂线端点坐标
    getPLsCorrd(globalPLs){
        let corrd3dArray=[];
        for(let PLline of globalPLs){
            corrd3dArray.push(
                [
                    [PLline.coordinates[0], PLline.coordinates[1]],
                    [PLline.coordinates[2], PLline.coordinates[3]]
                ]
            );
        }
        console.log("abs", corrd3dArray);
        return corrd3dArray;
    }

    // 添加天顶坐标到表格
    addZenithtoTable(zenith){
        document.getElementById('zenX').value = Math.round(zenith[0] * 100) / 100;
        document.getElementById('zenY').value = Math.round(zenith[1] * 100) / 100;
    }

    // 获取原始星星数据
    getOriginalStars(){

    }

    // 显示地理坐标
    showGeoEstimate(geoEstimate){
        
    }
}


export { Calc };