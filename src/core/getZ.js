import { rejectOutliers, deg2Rad, rad2Deg, cross, normalize, minimize } from './math.js';
import {
    AngleBetween,
    VectorFromSphere,
    Spherical,
    Vector,
    RotationMatrix,
    RotateVector,
    InverseRefraction,
} from 'astronomy-engine';

const sin = Math.sin;
const cos = Math.cos;

/**
 * 根据两颗星星计算像素焦距
 * @param {Star} star1
 * @param {Star} star2
 * @returns {Array<number>} 像素焦距解的数组
 */
function getZFrom2Stars(star1, star2) {
    // 理论夹角
    let theoreticalCosAngle = Math.cos(
        deg2Rad(
            AngleBetween(
                VectorFromSphere(new Spherical(rad2Deg(star1.lat), rad2Deg(star1.lon), 1), 0),
                VectorFromSphere(new Spherical(rad2Deg(star2.lat), rad2Deg(star2.lon), 1), 0)
            )
        )
    );

    let a = theoreticalCosAngle ** 2 - 1;
    let b =
        (star1.x ** 2 + star1.y ** 2 + star2.x ** 2 + star2.y ** 2) * theoreticalCosAngle ** 2 -
        2 * (star1.x * star2.x + star1.y * star2.y);
    let c =
        (star1.x ** 2 + star1.y ** 2) * (star2.x ** 2 + star2.y ** 2) * theoreticalCosAngle ** 2 -
        (star1.x * star2.x + star1.y * star2.y) ** 2;
    let delta = b ** 2 - 4 * a * c;
    // let z = Math.sqrt((-Math.sqrt(delta) - b) / (2 * a));

    /**
     * 注意：这里的解是平方根，所以可能有两个解，在使用各种条件筛除后仍然可能存在双解。
     * 目前的解法是都返回，然后在 getZ 函数中使用2 sigma 原则筛除异常值。
     */
    let solve1 = (-b + Math.sqrt(delta)) / (2 * a);
    let solve2 = (-b - Math.sqrt(delta)) / (2 * a);

    if (
        (star1.x * star2.x + star1.y * star2.y + solve1) * (star1.x * star2.x + star1.y * star2.y + solve2) > 0 &&
        solve1 >= 0 &&
        solve2 >= 0
    ) {
        return [Math.sqrt(solve1), Math.sqrt(solve2)];
    }
    if ((star1.x * star2.x + star1.y * star2.y + solve1) * theoreticalCosAngle > 0 && solve1 >= 0) {
        return [Math.sqrt(solve1)];
    }
    if ((star1.x * star2.x + star1.y * star2.y + solve2) * theoreticalCosAngle > 0 && solve2 >= 0) {
        return [Math.sqrt(solve2)];
    }

    return [];
}

/**
 * 两两选取星星计算像素焦距，取平均值
 * @param {Array<Star>} stars 星星数组
 * @returns {number} 平均像素焦距
 */
function getAnalyticalZ(stars) {
    let Z_list = [];
    // 两两计算
    for (let i = 0; i < stars.length; ++i) {
        for (let j = i + 1; j < stars.length; ++j) {
            let z = getZFrom2Stars(stars[i], stars[j]);
            Z_list = Z_list.concat(z);
        }
    }
    // 使用2 sigma原则剔除异常值
    let Z = rejectOutliers(Z_list);
    // 返回平均值
    return Z.reduce((a, b) => a + b) / Z.length;
}

/**
 * 计算一颗星星的高度角（与天顶角互余）
 * @param {Star} star 星星
 * @param {number} z 像素焦距
 * @param {Array<number>} zenithVector 天顶向量
 * @returns {number} 高度角（弧度）
 */
function getElevationAngle(star, z, zenithVector) {
    return Math.PI / 2 - deg2Rad(AngleBetween(new Vector(star.x, star.y, z, 0), zenithVector));
}

/**
 * 使用三段二分法修正折射偏差后的像素焦距
 * @param {Array<Star>} stars 星星数组
 * @param {number} z0 初始像素焦距
 * @param {Array<number>} zenith 天顶坐标 [x, y]
 * @returns {number} 像素焦距
 */
function getZWithoutRefraction(stars, z0, zenith) {
    /**
     * 向天顶向量逆时针旋转指定角度
     * @param {Astronomy.Vector} vector 向量
     * @param {Astronomy.Vector} zenithVector 天顶向量
     * @param {number} angle 旋转角度（角度）
     * @returns {Astronomy.Vector} 旋转后的向量（单位向量）
     */
    function rotate(vector, zenithVector, angle) {
        // 单位化
        vector = normalize(vector);
        zenithVector = normalize(zenithVector);
        // 旋转轴
        let axis = cross(vector, zenithVector);
        // 保证逆时针旋转
        angle = deg2Rad(-angle);
        // 罗德里格斯旋转公式
        let rotationMatrix = new RotationMatrix([
            [
                cos(angle) + axis.x ** 2 * (1 - cos(angle)),
                axis.x * axis.y * (1 - cos(angle)) - axis.z * sin(angle),
                axis.x * axis.z * (1 - cos(angle)) + axis.y * sin(angle),
            ],
            [
                axis.y * axis.x * (1 - cos(angle)) + axis.z * sin(angle),
                cos(angle) + axis.y ** 2 * (1 - cos(angle)),
                axis.y * axis.z * (1 - cos(angle)) - axis.x * sin(angle),
            ],
            [
                axis.z * axis.x * (1 - cos(angle)) - axis.y * sin(angle),
                axis.z * axis.y * (1 - cos(angle)) + axis.x * sin(angle),
                cos(angle) + axis.z ** 2 * (1 - cos(angle)),
            ],
        ]);
        return RotateVector(rotationMatrix, vector);
    }

    // z的上下限10%
    let z_min = z0 * 0.9;
    let z_max = z0 * 1.1;
    // 计算各星的赤道向量
    let starVectorEquator = stars.map(
        (star) => new VectorFromSphere(new Spherical(rad2Deg(star.lat), rad2Deg(star.lon), 1), 0)
    );
    // 计算各星理论夹角
    let angles = [];
    for (let i = 0; i < stars.length; ++i) {
        for (let j = i + 1; j < stars.length; ++j) {
            angles.push(AngleBetween(starVectorEquator[i], starVectorEquator[j]));
        }
    }
    // 使用优化函数求解
    function z_error(z) {
        // 计算天顶的观测向量
        let zenithVector = new Vector(zenith[0], zenith[1], z, 0);
        // 计算各星的观测向量
        let starVectorObserver = stars.map((star) => new Vector(star.x, star.y, z, 0));
        // 计算各星高度角
        let starAngles = stars.map((star) => rad2Deg(getElevationAngle(star, z, zenithVector)));
        // 计算去折射高度角修正值（添加到zenithAngles上就是未折射时的高度角）
        let starRefraction = starAngles.map((angle) => InverseRefraction('normal', angle));
        // 计算去折射后的各星的观测向量
        let starVectorReal = [];
        for (let i = 0; i < stars.length; ++i) {
            starVectorReal.push(rotate(starVectorObserver[i], zenithVector, starRefraction[i]));
        }
        // 计算去折射后的各星夹角
        let anglesReal = [];
        for (let i = 0; i < stars.length; ++i) {
            for (let j = i + 1; j < stars.length; ++j) {
                anglesReal.push(AngleBetween(starVectorReal[i], starVectorReal[j]));
            }
        }
        // 计算夹角总误差
        let error = 0;
        for (let i = 0; i < angles.length; ++i) {
            error += Math.abs(anglesReal[i] - angles[i]);
        }
        return error;
    }
    let z = minimize(z_error, z_min, z_max);
    return z;
}

/**
 * 获取像素焦距
 * @param {Array<Star>} stars 星星数组
 * @param {Array<number>} zenith 天顶坐标 [x, y]
 * @param {boolean} isFixRefraction 是否修正折射
 * @returns {number} 像素焦距
 */
function getZ(stars, zenith = NaN, isFixRefraction = false) {
    if (isFixRefraction) {
        let z0 = getAnalyticalZ(stars);
        return getZWithoutRefraction(stars, z0, zenith);
    } else {
        return getAnalyticalZ(stars);
    }
}

export { getZ, getElevationAngle };
