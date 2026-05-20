import { DefaultbuttonFunctioner } from './Default.js';
import { getOriginalStars, getGlobalPLPointsCoord, post } from '../utils.js';
import { getRaDecByName, optimizeMoonTime, vectorAngle } from '../AstroService.js';
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
    async calc(stars, globalPLsPointsCoord) {
        // 开始计算
        this.interactPhoto.buttonFunctioner = this;
        this.interactPhoto.tips.innerHTML = `计算中...`;

        // 读取设置
        let isFixRefraction = document.getElementById('check1').checked;
        let isFixGravity = document.getElementById('check2').checked;
        let approxTimestamp = this.interactPhoto.getTimestamp();
        let scopeDays = parseFloat(document.getElementById('setTimeScope').value);

        // 找到月亮索引并提取非月亮的标星数据
        const moonIdx = stars.findIndex((s) => ['月', '月亮', '月球', 'moon'].includes(s.name.trim().toLowerCase()));
        if (moonIdx === -1) {
            this.interactPhoto.tips.innerHTML = `没有找到月亮数据`;
            this.interactPhoto.resetbuttonFunctioner();
            return;
        }
        const subStars = stars.filter((_, idx) => idx !== moonIdx);

        try {
            // 1. 通过向后端的 positioning 发送不含月亮的星体坐标来估算地理位置与焦距
            const [geoEstimate, detail] = await post(
                `${BACKEND_API}/positioning`,
                {
                    photo: {
                        stars: subStars,
                        lines: globalPLsPointsCoord,
                    },
                    isFixRefraction: isFixRefraction,
                    isFixGravity: isFixGravity,
                },
                'json'
            );

            if (detail !== 'success' || !geoEstimate) {
                this.interactPhoto.tips.innerHTML = `定位估算失败：${detail}`;
                this.interactPhoto.resetbuttonFunctioner();
                return;
            }

            // 2. 计算月亮与其他星体的图上像素夹角作为 targetAngles
            const z = geoEstimate.z;
            const points3D = stars.map((s) => [s.x, s.y, z]);
            const targetAngles = points3D.map((p) => vectorAngle(points3D[moonIdx], p));

            // 3. 提前并行获取所有非太阳系天体的赤经赤纬 J2000 数据
            const preFetchedRaDecs = {};
            const starNames = stars.map((s) => s.name);

            this.interactPhoto.tips.innerHTML = `正在检索星体坐标...`;
            await Promise.all(
                starNames.map(async (name) => {
                    preFetchedRaDecs[name] = await getRaDecByName(name);
                })
            );

            // 检查星体坐标是否检索成功
            let missingStars = [];
            for (let i = 0; i < starNames.length; i++) {
                if (i === moonIdx) continue;
                if (!preFetchedRaDecs[starNames[i]]) {
                    missingStars.push(starNames[i]);
                }
            }
            if (missingStars.length > 0) {
                this.interactPhoto.tips.innerHTML = `未能获取天体 '${missingStars.join(', ')}' 的坐标信息，请检查拼写或网络`;
                this.interactPhoto.resetbuttonFunctioner();
                return;
            }

            // 4. 执行本地高精度迭代时间优化
            this.interactPhoto.tips.innerHTML = `正在推算精确拍摄时间...`;
            const bestTimestamp = await optimizeMoonTime(
                approxTimestamp,
                scopeDays,
                starNames,
                geoEstimate,
                moonIdx,
                targetAngles,
                preFetchedRaDecs
            );

            // 5. 显示结果并更新图上所有天体坐标
            this.interactPhoto.setDatebyTime(bestTimestamp);
            await this.celeCoord.calc();
            this.interactPhoto.tips.innerHTML = '计算拍摄时间成功';
        } catch (error) {
            this.interactPhoto.tips.innerHTML = `计算拍摄时间失败：${error.message}`;
        } finally {
            this.interactPhoto.resetbuttonFunctioner();
        }
    }

    // 检查originalStars数组每个子项的名称是否完整
    checkStars(originalStars) {
        return originalStars.every((originalStar) => originalStar.name && originalStar.name.trim() !== '');
    }

    // 检查月亮
    hasMoon(originalStars) {
        return originalStars.some(
            (star) => star.name && ['月', '月亮', '月球', 'moon'].includes(star.name.trim().toLowerCase())
        );
    }
}

export { MoonTime };
