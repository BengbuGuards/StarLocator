import { minimizeAsync } from '../math.js';
import { findMoonIndex, AngleBetweenMoonAndStar, geoEstimatebyStars, angleError } from './utils.js';

/**
 * 根据星星（含月）相互角距计算对应时间
 * @param {Array<Star>} stars 星星数组
 * @param {number} z 像素焦距
 * @param {Array<number>} zenith 顶点坐标
 * @param {Date} approxDate 大致日期
 * @param {number} scopeDate 日期搜索范围大小（单位天）
 * @param {AstroCalculator} astroCalculator 天文坐标计算器
 * @param {boolean} isFixGravity 是否修正重力
 * @param {boolean} isFixRefraction 是否修正大气折射
 * @returns {Date} 返回对应时间
 */
async function calc(
    stars,
    z,
    zenith,
    approxDate,
    scopeDate,
    astroCalculator,
    isFixGravity = false,
    isFixRefraction = false
) {
    let moonIndex = findMoonIndex(stars);
    // 获取月与各星相互角距作为目标值
    let targetAngles = AngleBetweenMoonAndStar(stars, moonIndex, z);
    // 根据星星信息计算大致日期下的地理坐标
    let geoEstimate = await geoEstimatebyStars(
        approxDate,
        stars,
        z,
        zenith,
        astroCalculator,
        moonIndex,
        isFixGravity,
        isFixRefraction
    );

    // 将scopeDate划分为每20天一个区间，对每个区间使用三段二分法minimize搜索最小误差，最后返回最小误差对应的时间
    let minTime = approxDate.getTime() - (scopeDate * 86400000) / 2;
    let maxTime = approxDate.getTime() + (scopeDate * 86400000) / 2;
    let minError = Infinity;
    let optTime = 0;
    let optFunc = async (time) =>
        await angleError(time, approxDate, stars, geoEstimate, moonIndex, astroCalculator, targetAngles);
    for (let lefti = minTime; lefti < maxTime; lefti += 20 * 86400000) {
        let righti = Math.min(lefti + 20 * 86400000, maxTime);
        let optTimeSingle = await minimizeAsync(optFunc, lefti, righti, 1e-6, 100);
        let timeError = await optFunc(optTimeSingle);
        // console.log(new Date(optTimeSingle), timeError);
        if (timeError < minError) {
            minError = timeError;
            optTime = optTimeSingle;
        }
    }

    // 返回最小误差对应的时间
    return new Date(optTime);
}

export { calc };
