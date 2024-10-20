import { rad2Deg, calculateMedian } from "../math.js";


/**
 * 平方倒数加权平均
 * @param {Array<Array<number>>} crudePositions 粗数据，每个元素有两组经纬度（角度制）
 * @param {Array<Star>} stars 星星数组
 * @param {Array<number>} zenithAngles 理论天顶角（角度制）
 * @returns {Array<number>} 平均经纬度（角度制）
 * @description 评估一个位置是否正确，计算该位置上与各 GP 之间的夹角与理论夹角的平方和的倒数
 * 该值越大，这个位置越正确
 * 返回正确的位置的平均值
*/
function squareMedianAverage(crudePositions, stars, zenithAngles) {
    /**
     * 评估一个位置是否正确
     * 计算该位置上与各 GP 之间的夹角与理论夹角的平方和的倒数
     * @param {Array<number>} pos 经纬度（角度制）
     * @returns 该值越大，这个位置越正确
     */
    function evaluate(pos) {
        let sum = 0;
        for (let k = 0; k < stars.length; ++k) {
            // 计算该位置的实际天顶角
            let angle = Astronomy.AngleBetween(
                Astronomy.VectorFromSphere(new Astronomy.Spherical(pos[0], pos[1], 1), 0),
                Astronomy.VectorFromSphere(new Astronomy.Spherical(rad2Deg(stars[k].lat), rad2Deg(stars[k].lon), 1), 0)
            );
            // 与理论天顶角比较
            let diff = angle - zenithAngles[k];
            sum += diff ** 2;
        }
        return 1 / sum;
    }

    // 评估，保留正确的位置和评估值
    let positions = [];
    for (let pair of crudePositions) {
        let s1 = evaluate(pair[0]);
        let s2 = evaluate(pair[1]);
        positions.push(s1 > s2 ? pair[0] : pair[1]);
    }

    // 计算3维向量的平均值，并转换为球坐标
    let CrudePositionVectors = positions.map(p => Astronomy.VectorFromSphere(new Astronomy.Spherical(p[0], p[1], 1), 0));
    let sum_x = 0, sum_y = 0, sum_z = 0;
    for (let pos of CrudePositionVectors) {
        sum_x += pos.x;
        sum_y += pos.y;
        sum_z += pos.z;
    }
    let avgPosition = Astronomy.SphereFromVector(new Astronomy.Vector(sum_x, sum_y, sum_z, 0));

    // 根据平均值消除经纬度的周期性，防止中位数计算错误
    let positions2 = positions.map(p => {
        let lat = adjustAngle(p[0], avgPosition.lat);
        let lon = adjustAngle(p[1], avgPosition.lon);
        return [lat, lon];
    });

    // 求positions中位数
    let latList = positions2.map(p => p[0]);
    let lonList = positions2.map(p => p[1]);
    let medianLat = calculateMedian(latList);
    let MedianLon = calculateMedian(lonList);

    return [medianLat, MedianLon];
}


/**
 * 调整角度，使其与平均值的差值在 -180 到 180 之间
 * @param {number} angle 角度
 * @param {number} avgAngle 平均角度
 * @returns {number} 调整后的角度
 */
function adjustAngle(angle, avgAngle) {
    if (angle - avgAngle > 180) {
        return angle - 360;
    } else if (angle - avgAngle < -180) {
        return angle + 360;
    } else {
        return angle;
    }
}

export { squareMedianAverage };