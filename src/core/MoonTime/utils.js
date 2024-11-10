import { calc as geoCalc } from '../calc.js';
import { deg2Rad } from "../math.js";
import { AngleBetween, VectorFromSphere, Vector, Spherical, Observer } from "astronomy-engine";


/**
 * 从星星数组中找到月的索引
 * @param {Array<Star>} stars 星星数组
 * @returns {number} 返回月的索引
 */
function findMoonIndex(stars) {
    let moonIndex = stars.findIndex(
        star => star.name === "月" || star.name === "月球" || star.name === "月亮"
        || star.name.toLowerCase() === "moon"
    );
    return moonIndex;
}

/**
 * 计算月与星星相互角距
 * @param {Array<Star>} stars 星星数组
 * @param {number} moonIndex 月的索引
 * @param {number} z 像素焦距
 * @returns {Array<number>} 返回月与星星相互角距
 */
function AngleBetweenMoonAndStar(stars, moonIndex, z) {
    let targetAngles = [];
    for (let i = 0; i < stars.length; ++i) {
        targetAngles.push(
            AngleBetween(
                new Vector(stars[moonIndex].x, stars[moonIndex].y, z, 0),
                new Vector(stars[i].x, stars[i].y, z, 0),
            )
        );
    }
    return targetAngles;
}

/**
 * 根据星星信息计算大致日期下的地理坐标
 * @param {Date} approxDate 大致日期
 * @param {Array<Star>} stars 星星数组
 * @param {number} z 像素焦距
 * @param {Array<number>} zenith 顶点坐标
 * @param {AstroCalculator} astroCalculator 天文坐标计算器
 * @param {number} moonIndex 月在星数组的索引
 * @param {boolean} isFixGravity 是否修正重力
 * @param {boolean} isFixRefraction 是否修正大气折射
 * @returns {Date} 返回对应时间
 */
async function geoEstimatebyStars(approxDate, stars, z, zenith, astroCalculator, moonIndex, isFixGravity = false, isFixRefraction = false) {
    // 根据大致日期获取各星时角赤纬
    let date = new Date(approxDate);
    let approxStarHaDecs = await astroCalculator.getHaDecbyNames(stars.map(star => star.name), date);
    approxStarHaDecs.forEach((value, key) => {
        stars.find(star => star.name === key).lon = deg2Rad(360 - value[0] * 15);
        stars.find(star => star.name === key).lat = deg2Rad(value[1]);
    });
    // 计算大致日期下的地理坐标
    let geoEstimate = geoCalc(
        stars.filter((star, index) => index !== moonIndex),
        // z, zeniths, true, true //TODO
        z, zenith, isFixGravity, isFixRefraction
    );
    return geoEstimate;
}

/**
 * 误差函数，计算每一天的星星（含月）相互角距，输出误差
 * @param {Number} time 时间戳 
 * @param {Date} approxDate 大致日期
 * @param {Array<Star>} stars 星星数组
 * @param {Array<number>} geoEstimate 地理坐标
 * @param {number} moonIndex 月的索引
 * @param {AstroCalculator} astroCalculator 天文坐标计算器
 * @param {Array<number>} targetAngles 目标角距
 * @returns {Number} 返回星角距误差和
 */
async function angleError(time, approxDate, stars, geoEstimate, moonIndex, astroCalculator, targetAngles) {
    let date = new Date(time);
    // 使用恒星日周期快速计算该时间下观测者地理坐标
    let observerLon = (geoEstimate[1] - (time - approxDate.getTime()) / 86164090.5 * 360) % 360;
    // observerLon to [-180, 180]
    if (observerLon > 180) observerLon -= 360;
    if (observerLon < -180) observerLon += 360;
    // 得到该时间所计算的观测者地理坐标
    let observer = new Observer(geoEstimate[0], observerLon, 0);
    // 获取该时间、该地理坐标下的天体时角赤纬
    let starHaDecs = await astroCalculator.getHaDecbyNames(stars.map(star => star.name), date, observer);
    let moonHaDec = starHaDecs.get(stars[moonIndex].name);
    // 计算每颗星星（不包含月）与月的角距误差
    let errors = [];
    for (let i = 0; i < stars.length; ++i) {
        if (i === moonIndex) continue;
        let starHaDec = starHaDecs.get(stars[i].name);
        let angle = AngleBetween(
            VectorFromSphere(new Spherical(moonHaDec[1], moonHaDec[0]*15, 1), 0),
            VectorFromSphere(new Spherical(starHaDec[1], starHaDec[0]*15, 1), 0)
        );
        errors.push((angle - targetAngles[i])**2);
    }
    return errors.reduce((acc, cur) => acc + cur, 0);
}


export { findMoonIndex, AngleBetweenMoonAndStar, geoEstimatebyStars, angleError };