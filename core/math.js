import { Vector } from "./astronomy.js";


/**
 * 向量加法
 * @param {Vector} v1
 * @param {Vector} v2
 * @returns {Vector}
 */
function add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, 0);
}


/**
 * 向量点乘
 * @param {Vector} v1
 * @param {Vector} v2
 * @returns {number}
 */
function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}


/**
 * 向量元素乘
 * @param {number} n
 * @param {Vector} v
 * @returns {Vector}
 */
function multiply(n, v) {
    return new Vector(n * v.x, n * v.y, n * v.z, 0);
}


/**
 * 角度制转弧度制
 * @param {number} deg 
 * @returns {number}
 */
function deg2Rad(deg) {
    return deg * Math.PI / 180;
}


/**
 * 弧度制转角度制
 * @param {number} rad 
 * @returns {number}
 */
function rad2Deg(rad) {
    return rad * 180 / Math.PI;
}

/**
 * 剔除数组中的指定sigma外的异常值
 * @param {Array<number>} arr
 * @param {number} sigma
 * @returns {Array<number>}
 */
function rejectOutliers(arr, sigma = 2) {
    let mean = arr.reduce((a, b) => a + b) / arr.length;
    let std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2) / arr.length);
    return arr.filter(x => Math.abs(x - mean) < sigma * std);
}

export { add, dot, multiply, deg2Rad, rad2Deg, rejectOutliers };
