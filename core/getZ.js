import { AngleBetween, VectorFromSphere, Spherical } from "./astronomy.js";
import { rejectOutliers, deg2Rad, rad2Deg } from "./math.js";


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
    console.log("theoreticalCosAngle", theoreticalCosAngle);

    let a = theoreticalCosAngle ** 2 - 1;
    let b = (star1.x ** 2 + star1.y ** 2 + star2.x ** 2 + star2.y ** 2) * theoreticalCosAngle ** 2 - 2 * (star1.x * star2.x + star1.y * star2.y);
    let c = (star1.x ** 2 + star1.y ** 2) * (star2.x ** 2 + star2.y ** 2) * theoreticalCosAngle ** 2 - (star1.x * star2.x + star1.y * star2.y) ** 2;
    let delta = b ** 2 - 4 * a * c;
    // let z = Math.sqrt((-Math.sqrt(delta) - b) / (2 * a));

    /**
     * 注意：这里的解是平方根，所以可能有两个解，在使用各种条件筛除后仍然可能存在双解。
     * 目前的解法是都返回，然后在 getZ 函数中使用2 sigma 原则筛除异常值。
     */
    let solve1 = (-b + Math.sqrt(delta)) / (2 * a);
    let solve2 = (-b - Math.sqrt(delta)) / (2 * a);
    
    if ((star1.x*star2.x + star1.y*star2.y + solve1) * (star1.x*star2.x + star1.y*star2.y + solve2) > 0
        && solve1 >= 0 && solve2 >= 0) {
        return [Math.sqrt(solve1), Math.sqrt(solve2)];
    }
    if ((star1.x*star2.x + star1.y*star2.y + solve1) * theoreticalCosAngle > 0 && solve1 >= 0) {
        return [Math.sqrt(solve1)];
    }
    if ((star1.x*star2.x + star1.y*star2.y + solve2) * theoreticalCosAngle > 0 && solve2 >= 0) {
        return [Math.sqrt(solve2)];
    }
    
    return [];
}


/**
 * 两两选取星星计算像素焦距，取平均值
 * @param {Array<Star>} stars 星星数组
 * @returns {number} 平均像素焦距
 */
function getZ(stars) {
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


export { getZ };
