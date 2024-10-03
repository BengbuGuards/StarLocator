import { Star } from "./data.js";
import { rad2Deg, Vector, vectorAngle } from "./math.js";

const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;


/**
 * 获取一颗星星的平面方程 Ax + By + Cz = D 的 A, B, C, D
 * @param {Star} star 星星
 * @param {number} elevationAngle 高度角
 * @returns {Array<number>} [A, B, C, D]
 */
function getPlain(star, elevationAngle) {
    let phi = star.lat;
    let lam = star.lon;
    let theta = elevationAngle;
    return [
        sin(theta) * cos(lam) * cos(phi),
        sin(lam) * sin(theta) * cos(phi),
        sin(phi) * sin(theta),
        sin(theta) ** 2
    ];
}


/**
 * 解两个平面与地球（单位球）联立的方程组
 * @param {Array<number>} plane1 [A1, B1, C1, D1]
 * @param {Array<number>} plane2 [A2, B2, C2, D2]
 * @returns {Array<Array<number>>} 两个交点的经纬度（弧度制）
 */
function solve(plane1, plane2) {
    let [A1, B1, C1, D1] = plane1;
    let [A2, B2, C2, D2] = plane2;

    let x1 = (-A1 * B1 * B2 * D2 + A1 * B2 ** 2 * D1 - A1 * C1 * C2 * D2 + A1 * C2 ** 2 * D1 + A2 * B1 ** 2 * D2 - A2 * B1 * B2 * D1 + A2 * C1 ** 2 * D2 - A2 * C1 * C2 * D1 - B1 * C2 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) + B2 * C1 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2)) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2);
    let y1 = (A1 ** 2 * B2 * D2 - A1 * A2 * B1 * D2 - A1 * A2 * B2 * D1 + A1 * C2 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) + A2 ** 2 * B1 * D1 - A2 * C1 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) - B1 * C1 * C2 * D2 + B1 * C2 ** 2 * D1 + B2 * C1 ** 2 * D2 - B2 * C1 * C2 * D1) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2);
    let z1 = -(A1 * B2 - A2 * B1) * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2) + (A1 ** 2 * C2 * D2 - A1 * A2 * C1 * D2 - A1 * A2 * C2 * D1 + A2 ** 2 * C1 * D1 + B1 ** 2 * C2 * D2 - B1 * B2 * C1 * D2 - B1 * B2 * C2 * D1 + B2 ** 2 * C1 * D1) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2);
    let x2 = (-A1 * B1 * B2 * D2 + A1 * B2 ** 2 * D1 - A1 * C1 * C2 * D2 + A1 * C2 ** 2 * D1 + A2 * B1 ** 2 * D2 - A2 * B1 * B2 * D1 + A2 * C1 ** 2 * D2 - A2 * C1 * C2 * D1 + B1 * C2 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) - B2 * C1 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2)) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2);
    let y2 = (A1 ** 2 * B2 * D2 - A1 * A2 * B1 * D2 - A1 * A2 * B2 * D1 - A1 * C2 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) + A2 ** 2 * B1 * D1 + A2 * C1 * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) - B1 * C1 * C2 * D2 + B1 * C2 ** 2 * D1 + B2 * C1 ** 2 * D2 - B2 * C1 * C2 * D1) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2);
    let z2 = (A1 * B2 - A2 * B1) * sqrt(A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - A1 ** 2 * D2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + 2 * A1 * A2 * D1 * D2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 - A2 ** 2 * D1 ** 2 + B1 ** 2 * C2 ** 2 - B1 ** 2 * D2 ** 2 - 2 * B1 * B2 * C1 * C2 + 2 * B1 * B2 * D1 * D2 + B2 ** 2 * C1 ** 2 - B2 ** 2 * D1 ** 2 - C1 ** 2 * D2 ** 2 + 2 * C1 * C2 * D1 * D2 - C2 ** 2 * D1 ** 2) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2) + (A1 ** 2 * C2 * D2 - A1 * A2 * C1 * D2 - A1 * A2 * C2 * D1 + A2 ** 2 * C1 * D1 + B1 ** 2 * C2 * D2 - B1 * B2 * C1 * D2 - B1 * B2 * C2 * D1 + B2 ** 2 * C1 * D1) / (A1 ** 2 * B2 ** 2 + A1 ** 2 * C2 ** 2 - 2 * A1 * A2 * B1 * B2 - 2 * A1 * A2 * C1 * C2 + A2 ** 2 * B1 ** 2 + A2 ** 2 * C1 ** 2 + B1 ** 2 * C2 ** 2 - 2 * B1 * B2 * C1 * C2 + B2 ** 2 * C1 ** 2);

    /**
     * 空间直角坐标转经纬度（弧度制）
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Array<number>} [纬度, 经度]（弧度制）
     */
    function xyz2LatLon(x, y, z) {
        let lat = Math.asin(z);
        let lon = Math.atan2(y, x);
        return [lat, lon];
    }

    return [xyz2LatLon(x1, y1, z1), xyz2LatLon(x2, y2, z2)];
}


/**
 * 双星定位
 * @param {Star} star1 星星1
 * @param {Star} star2 星星2
 * @param {number} z 像素焦距
 * @param {Array<number>} zenithVector 天顶向量
 * @returns {Array<number>} 两组经纬度（弧度制）
 */
function dualStarPositioning(star1, star2, z, zenithVector) {
    /**
     * 计算一颗星星的高度角（与天顶角互余）
     * @param {Star} star 
     * @returns 高度角（弧度制）
     */
    const getElevationAngle = (star) => Math.PI / 2
        - vectorAngle(new Vector(star.x, star.y, z), zenithVector);

    // 计算平面方程
    let plane1 = getPlain(star1, getElevationAngle(star1));
    let plane2 = getPlain(star2, getElevationAngle(star2));

    // 联立求解
    return solve(plane1, plane2);
}


/**
 * 两两计算位置，取平均值
 * @param {Array<Star>} stars 星星数组
 * @param {number} z 像素焦距
 * @param {Array<number>} zenith 天顶坐标 [x, y]
 * @returns 平均经纬度（角度制）
 */
function calc(stars, z, zenith) {
    // 天顶向量
    let zenithVector = new Vector(zenith[0], zenith[1], z);
    // 存放粗的数据，每个元素有两组经纬度
    let crudePositions = []
    // 两两计算
    for (let i = 0; i < stars.length; ++i) {
        for (let j = i + 1; j < stars.length; ++j) {
            crudePositions.push(dualStarPositioning(stars[i], stars[j], z, zenithVector));
        }
    }

    // 每颗星星的理论天顶角
    let zenithAngles = [];
    for (let star of stars) {
        zenithAngles.push(vectorAngle(new Vector(star.x, star.y, z), zenithVector));
    }

    /**
     * 评估一个位置是否正确
     * 计算该位置上与各 GP 之间的夹角与理论夹角的平方和的倒数
     * @param {Array<number>} pos 经纬度（弧度制）
     * @returns 该值越大，这个位置越正确
     */
    function evaluate(pos) {
        let sum = 0;
        for (let k = 0; k < stars.length; ++k) {
            // 计算该位置的实际天顶角
            let angle = vectorAngle(
                Vector.fromGP(pos[0], pos[1]),
                Vector.fromGP(stars[k].lat, stars[k].lon)
            );
            // 与理论天顶角比较
            let diff = angle - zenithAngles[k];
            sum += diff ** 2;
        }
        return 1 / sum;
    }

    // 评估，保留正确的位置
    let positions = [];
    for (let pair of crudePositions) {
        let s1 = evaluate(pair[0]);
        let s2 = evaluate(pair[1]);
        positions.push(s1 > s2 ? pair[0] : pair[1]);
    }

    // 求平均值
    let avgLat = 0;
    let avgLon = 0;
    for (let latLon of positions) {
        let [lat, lon] = latLon;
        avgLat += lat / positions.length;
        avgLon += lon / positions.length;
    }

    // 转角度制
    avgLat = rad2Deg(avgLat);
    avgLon = rad2Deg(avgLon);

    return [avgLat, avgLon];
}


export { calc };
