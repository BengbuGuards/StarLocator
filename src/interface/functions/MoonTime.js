import { getZ } from '../../core/getZ.js';
import { markStars } from '../../core/mark.js';
import { calc } from '../../core/MoonTime/calc.js';
import { DefaultbuttonFunctioner } from './Default.js';
import { getVPoint } from '../../core/algorithm/VPoint.js'
import { findMoonIndex } from '../../core/MoonTime/utils.js';
import { getOriginalStars, getGlobalPLPointsCoord } from '../utils.js';


class MoonTime extends DefaultbuttonFunctioner {
    constructor(interactPhoto, astroCalculator, celeCoord) {
        super(interactPhoto);
        this.astroCalculator = astroCalculator;
        this.celeCoord = celeCoord;
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        // 读取数据
        let globalPLsPointsCoord = getGlobalPLPointsCoord(this.interactPhoto);
        let originalStars = getOriginalStars(this.interactPhoto);
        let stars = markStars(originalStars);

        // 检查数据
        if (!this.checkStars(originalStars)) {
            this.interactPhoto.tips.innerHTML = `请完整填写星星名称`;
            return;
        } else if (findMoonIndex(stars) === -1) {
            this.interactPhoto.tips.innerHTML = `请标记月亮`;
            return;
        } else if (stars.length < 4) {
            this.interactPhoto.tips.innerHTML = `除月外请至少选择三颗星`;
            return;
        } else if (globalPLsPointsCoord.length < 2) {
            this.interactPhoto.tips.innerHTML = `请至少选择两条铅垂线`;
            return;
        }

        // 先计算天体坐标
        this.celeCoord.calc().then((code) => {
            // 如果天体坐标计算成功，再计算地理位置
            if (code == 0) {
                // 重新读取已更新的数据
                let originalStars = getOriginalStars(this.interactPhoto);
                let stars = markStars(originalStars);
                this.calc(stars, globalPLsPointsCoord);
            }
        });
    }

    // 计算拍摄时间
    calc(stars, globalPLsPointsCoord) {
        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;

        // 读取设置
        let isFixRefraction = document.getElementById('check1').checked;
        let isFixGravity = document.getElementById('check2').checked;

        // 计算灭点
        let zenith = getVPoint(globalPLsPointsCoord);

        // 计算焦距
        let z = getZ(
            stars.filter((star, index) => index !== findMoonIndex(stars)),  // 注意用除月外的星星算
            zenith, isFixRefraction
        );
        if (isNaN(z)) {
            this.interactPhoto.tips.innerHTML = "无法计算像素焦距";
            return;
        }

        // 计算时间
        let approxDate = this.interactPhoto.getDateTime();
        let scopeDate = parseFloat(document.getElementById('setTimeScope').value);
        calc(stars, z, zenith, approxDate, scopeDate, this.astroCalculator, isFixGravity, isFixRefraction).then(date => {
            // 显示结果
            this.interactPhoto.setDateTime(date);
    
            // 结束计算
            this.interactPhoto.tips.innerHTML = '计算拍摄时间成功';
            this.interactPhoto.resetbuttonFunctioner();
        });
    }

    // 检查originalStars数组每个子项的名称是否完整
    checkStars(originalStars) {
        let isComplete = true;
        originalStars.forEach(originalStar => {
            if (originalStar[0] === '') {
                isComplete = false;
            }
        });
        return isComplete;
    }
}


export { MoonTime };