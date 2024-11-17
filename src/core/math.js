import { Vector } from 'astronomy-engine';
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
 * 向量叉乘
 * @param {Vector} v1
 * @param {Vector} v2
 * @returns {Vector}
 */
function cross3d(v1, v2) {
    return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x, 0);
}

/**
 * 2维向量叉乘，叉乘结果为标量。输入的向量，只关心前两维
 * @param {Vector} v1
 * @param {Vector} v2
 * @returns {number}
 */
function cross2d(v1, v2) {
    const res = cross3d(v1, v2);
    return res.z;
}

/**
 * 向量归一化
 * @param {Vector} v
 * @returns {Vector}
 */
function normalize(v) {
    let length = v.Length();
    return new Vector(v.x / length, v.y / length, v.z / length, 0);
}

/**
 * 角度制转弧度制
 * @param {number} deg
 * @returns {number}
 */
function deg2Rad(deg) {
    return (deg * Math.PI) / 180;
}

/**
 * 弧度制转角度制
 * @param {number} rad
 * @returns {number}
 */
function rad2Deg(rad) {
    return (rad * 180) / Math.PI;
}

/**
 * 使得角度位于 [-180,180]
 * @param {number} rad
 * @returns {number}
 */
function wrapAngleInDeg(deg) {
    while (deg > 180) {
        deg -= 360;
    }
    while (deg < -180) {
        deg += 360;
    }
    return deg;
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
    return arr.filter((x) => Math.abs(x - mean) < sigma * std);
}

/**
 * 计算中位数
 * @param {Array<number>} numbers
 * @returns {number}
 */
function calculateMedian(numbers) {
    // 首先对数组进行排序
    numbers.sort((a, b) => a - b);

    const middleIndex = Math.floor(numbers.length / 2);

    // 判断数组长度是奇数还是偶数
    if (numbers.length % 2 === 0) {
        // 偶数个元素，返回中间两个元素的平均值
        return (numbers[middleIndex - 1] + numbers[middleIndex]) / 2;
    } else {
        // 奇数个元素，返回中间的元素
        return numbers[middleIndex];
    }
}

/**
 * 三段二分法求函数极小值
 * @param {Function} func 优化函数
 * @param {number} lowerBound 区间左端点
 * @param {number} upperBound 区间右端点
 * @param {number} tolerance 误差容限
 * @param {number} maxIter 最大迭代次数
 * @returns {number} 返回极小值点 x
 */
function minimize(func, lowerBound, upperBound, tolerance = 1e-6, maxIter = 60) {
    let left = lowerBound;
    let right = upperBound;
    let iter = 0;

    while (right - left > tolerance && iter < maxIter) {
        let midLeft = left + (right - left) / 3;
        let midRight = right - (right - left) / 3;

        if (func(midLeft) < func(midRight)) {
            right = midRight;
        } else {
            left = midLeft;
        }
        iter += 1;
    }

    // 返回最小点 x
    return (left + right) / 2;
}

/**
 * 三段二分法求函数极小值（异步）
 * @param {Function} func 优化函数（异步）
 * @param {number} lowerBound 区间左端点
 * @param {number} upperBound 区间右端点
 * @param {number} tolerance 误差容限
 * @param {number} maxIter 最大迭代次数
 * @returns {number} 返回极小值点 x
 */
async function minimizeAsync(func, lowerBound, upperBound, tolerance = 1e-6, maxIter = 60) {
    let left = lowerBound;
    let right = upperBound;
    let iter = 0;

    while (right - left > tolerance && iter < maxIter) {
        let midLeft = left + (right - left) / 3;
        let midRight = right - (right - left) / 3;

        if ((await func(midLeft)) < (await func(midRight))) {
            right = midRight;
        } else {
            left = midLeft;
        }
        iter += 1;
    }

    // 返回最小点 x
    return (left + right) / 2;
}

export {
    add,
    dot,
    multiply,
    cross3d,
    cross2d,
    normalize,
    deg2Rad,
    rad2Deg,
    wrapAngleInDeg,
    rejectOutliers,
    calculateMedian,
    minimize,
    minimizeAsync,
};
