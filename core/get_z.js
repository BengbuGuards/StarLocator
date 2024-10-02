import { Star } from "./data.js";
import { Vector, vectorAngle } from "./math.js";


/**
 * 根据两颗星星计算像素焦距
 * @param {Star} star1 
 * @param {Star} star2 
 * @returns {number} 像素焦距
 */
function getZFrom2Stars(star1, star2) {
    // 理论夹角
    let theoreticalAngle = vectorAngle(
        Vector.fromGP(star1.lat, star1.lon),
        Vector.fromGP(star2.lat, star2.lon)
    )

    /**
     * 根据已有条件，代入一个尝试的像素焦距求夹角
     * 当两颗星星在不同象限时，单调递减
     * 当两颗星星在相同象限时，先上升后下降
     * @param {number} z 尝试的像素焦距
     * @returns {number} 尝试夹角（弧度制）
     */
    function tryAngle(z) {
        return vectorAngle(
            new Vector(star1.x, star1.y, z),
            new Vector(star2.x, star2.y, z)
        )
    }

    // 二分查找
    const acceptableError = 1e-3    // 可接受的误差范围
    // 确定查找下限，从递减的部分开始
    let left = 1;
    const step = 10;
    let last = 0;
    while (true) {
        let current = tryAngle(left);
        if (current > last) {
            last = current
            left += step;
        } else {
            break
        }
    }
    // 确定查找上限
    let right = left + 1;
    while (tryAngle(right) > theoreticalAngle) {
        right *= 2;
    }
    // 开始查找
    let mid;
    while (right - left > acceptableError) {
        mid = (left + right) / 2;
        if (tryAngle(mid) > theoreticalAngle) {
            left = mid;
        } else {
            right = mid;
        }
    }
    return mid;
}


/**
 * 两两选取星星计算像素焦距，取平均值
 * @param {Array<Star>} stars 星星数组
 * @returns {number} 平均像素焦距
 */
function getZ(stars) {
    let sum = 0;
    let cnt = 0;
    // 两两计算
    for (let i = 0; i < stars.length; ++i) {
        for (let j = i + 1; j < stars.length; ++j) {
            sum += getZFrom2Stars(stars[i], stars[j]);
            ++cnt;
        }
    }
    return sum / cnt;
}


export { getZ };
