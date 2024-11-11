import { getZ } from '../../core/getZ.js';
import { markStars } from '../../core/mark.js';
import { calc } from '../../core/MoonTime/calc.js';
import { DefaultbuttonFunctioner } from './Default.js';
import { getVPoint } from '../../core/algorithm/VPoint.js'
import { findMoonIndex } from '../../core/MoonTime/utils.js';
import { getOriginalStars, getGlobalPLPointsCoord } from '../utils.js';


class MoonTime extends DefaultbuttonFunctioner {
    constructor(interactPhoto, astroCalculator) {
        super(interactPhoto);
        this.astroCalculator = astroCalculator;
    }

    onClick() {
        super.onClick();
        if (!this.interactPhoto.movable) return;

        // 读取数据
        let globalPLsPointsCoord = getGlobalPLPointsCoord(this.interactPhoto);
        let originalStars = getOriginalStars(this.interactPhoto);
        let stars = markStars(originalStars);

        // 检查数据
        if (findMoonIndex(stars) === -1) {
            this.interactPhoto.tips.innerHTML = `请标记月亮`;
            return;
        } else if (stars.length < 4) {
            this.interactPhoto.tips.innerHTML = `除月外请至少选择三颗星`;
            return;
        } else if (globalPLsPointsCoord.length < 2) {
            this.interactPhoto.tips.innerHTML = `请至少选择两条铅垂线`;
            return;
        }

        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;

        // 计算灭点
        let zenith = getVPoint(globalPLsPointsCoord);

        // 计算焦距
        let isFixRefraction = document.getElementById('check1').checked;
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
        calc(stars, z, zenith, approxDate, scopeDate, this.astroCalculator).then(date => {
            // 显示结果
            this.interactPhoto.setDateTime(date);
    
            // 结束计算
            this.interactPhoto.tips.innerHTML = '计算拍摄时间成功';
            this.interactPhoto.resetbuttonFunctioner();
        });
    }
}


export { MoonTime };