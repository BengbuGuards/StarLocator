import { DefaultbuttonFunctioner } from './Default.js';
import { getOriginalStars, getGlobalPLPointsCoord, postJSON } from '../utils.js';
import { BACKEND_API } from '../../config.js';

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

        // 检查数据
        if (!this.checkStars(originalStars)) {
            this.interactPhoto.tips.innerHTML = `请完整填写星星名称`;
            return;
        } else if (!this.hasMoon(originalStars)) {
            this.interactPhoto.tips.innerHTML = `请标记月亮`;
            return;
        } else if (originalStars.length < 4) {
            this.interactPhoto.tips.innerHTML = `除月外请至少选择三颗星`;
            return;
        } else if (globalPLsPointsCoord.length < 2) {
            this.interactPhoto.tips.innerHTML = `请至少选择两条铅垂线`;
            return;
        }

        let isAutoCeleCoord = document.getElementById('check3').checked; // 是否自动计算天体坐标
        if (isAutoCeleCoord) {
            // 先计算天体坐标
            this.celeCoord.calc().then((code) => {
                // 如果天体坐标计算成功，再计算地理位置
                if (code == 0) {
                    // 重新读取已更新的数据
                    let originalStars = getOriginalStars(this.interactPhoto);
                    this.calc(originalStars, globalPLsPointsCoord);
                }
            });
        } else {
            this.calc(originalStars, globalPLsPointsCoord);
        }
    }

    // 计算拍摄时间
    calc(stars, globalPLsPointsCoord) {
        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;

        // 读取设置
        let isFixRefraction = document.getElementById('check1').checked;
        let isFixGravity = document.getElementById('check2').checked;
        let approxTimestamp = this.interactPhoto.getTimestamp();
        let scopeDays = parseFloat(document.getElementById('setTimeScope').value);

        // 计算拍摄时间
        postJSON(`${BACKEND_API}/moontime`, {
            photo: {
                stars: stars,
                lines: globalPLsPointsCoord,
            },
            approxTimestamp: approxTimestamp,
            scopeDays: scopeDays,
            isFixRefraction: isFixRefraction,
            isFixGravity: isFixGravity,
        }).then(([results, detail]) => {
            if (detail === 'success') {
                // 显示结果
                this.interactPhoto.setDatebyTime(results['time']);
                // 使用新时间重新计算天体坐标并显示
                this.celeCoord.calc().then(() => {
                    this.interactPhoto.tips.innerHTML = '计算拍摄时间成功';
                });
            } else {
                this.interactPhoto.tips.innerHTML = `计算拍摄时间失败：${detail}`;
            }
        });

        // 结束计算
        this.interactPhoto.resetbuttonFunctioner();
    }

    // 检查originalStars数组每个子项的名称是否完整
    checkStars(originalStars) {
        let isComplete = true;
        originalStars.forEach((originalStar) => {
            if (originalStar[0] === '') {
                isComplete = false;
            }
        });
        return isComplete;
    }

    // 检查月亮
    hasMoon(originalStars) {
        return originalStars.some(
            (star) => star['name'] === '月' || star['name'] === '月亮' || star['name'] === 'moon'
        );
    }
}

export { MoonTime };
