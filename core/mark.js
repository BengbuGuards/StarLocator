import { Star } from "./data.js";
import { deg2Rad } from "./math.js";


/**
 * 将时角的单位转化为 h
 * @param {string} hourAngle 原始格式的时角
 * @return {number}
 */
function toHours(hourAngle) {
    const pattern = /(\d+)h(\d+)m(\d+(?:\.\d+)?)s/;
    let match = hourAngle.match(pattern);

    let h = parseFloat(match[1]);
    let m = parseFloat(match[2]);
    let s = parseFloat(match[3]);

    return h + m / 60 + s / 3600;
}


/**
 * 将赤纬的单位转化为度
 * @param {string} declination 原始格式的赤纬
 * @returns {number}
 */
function toDegrees(declination) {
    const pattern = /([+-]?)(\d+)°(\d+)'(\d+(?:\.\d+)?)"/;
    let match = declination.match(pattern);

    let sign = match[1];
    let d = parseFloat(match[2]);
    let m = parseFloat(match[3]);
    let s = parseFloat(match[4]);

    return (sign === '-' ? -1 : 1) * (d + m / 60 + s / 3600);
}


/**
 * 处理原始数据，标记星星
 * @param {Array<Array>} originalStars 所有星星的原始数据，在这个数组里的每个数组应为
 *                                     [x, y, 名字, 时角, 赤纬（两者均为角度制）]
 * @returns {Array<Star>} Star 对象数组
 */
function markStars(originalStars) {
    let stars = []
    // 遍历每组原始数据
    for (let originalStar of originalStars) {
        let [x, y, name, hourAngle, declination] = originalStar;
        // 转化单位
        hourAngle = toHours(hourAngle);
        declination = toDegrees(declination);
        // 计算 GP 并转为弧度制
        let lat = deg2Rad(declination);
        let lon = deg2Rad(360 - hourAngle * 15);
        // 添加星星
        stars.push(new Star(x, y, name, lat, lon));
    }
    return stars;
}


export { markStars };
