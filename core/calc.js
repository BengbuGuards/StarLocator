import * as astro from "./astronomy.js";
import { deg2Rad } from "./math.js";
import { squareWeightedAverage } from "./algorithm/squareWeightedAverage.js";

const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;


/**
 * 获取一颗星星的平面方程 Ax + By + Cz = D 的 A, B, C, D
 * @param {Star} star 星星
 * @param {number} elevationAngle 高度角（弧度制）
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
     * 2024/10/4 gc
     * 大气折射修正的经验公式，精度聊胜于无。输入、输出单位均为弧度
     * 折射修正仰角 = 仰角 - 0.000000034144 * cot(仰角) ** 3 + 0.000005128 * cot(仰角) ** 2 - 0.000301915 * cot(仰角)
     */

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

    let solve1 = astro.SphereFromVector(new astro.Vector(x1, y1, z1, 0));
    let solve2 = astro.SphereFromVector(new astro.Vector(x2, y2, z2, 0));
    return [[solve1.lat, solve1.lon], [solve2.lat, solve2.lon]];
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
        - deg2Rad(astro.AngleBetween(new astro.Vector(star.x, star.y, z, 0), zenithVector));


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
    let zenithVector = new astro.Vector(zenith[0], zenith[1], z, 0)
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
        zenithAngles.push(astro.AngleBetween(new astro.Vector(star.x, star.y, z, 0), zenithVector));
    }

    // 加权平均
    let [avgLat, avgLon, positions] = squareWeightedAverage(crudePositions, stars, zenithAngles);

    return [avgLat, avgLon];
}

/**
 * 2024/10/4 gc 重力纬度修正
 * 对计算完成的纬度进行进一步重力方向修正。输入输出单位均为角度
 * 重力修正纬度 = 纬度 + (0.00032712 * sin(纬度) ** 2 - 0.00000368 * sin(纬度) - 0.099161) * sin (纬度 * 2)
 * /
 
export { calc };
