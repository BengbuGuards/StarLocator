import { calculateMedian, cross2d, add, multiply } from '../math.js';
import { Vector } from 'astronomy-engine';

/**
 * 计算两条直线的交点
 * @param {Array<number, number>} line1 直线1（两点式）
 * @param {Array<number, number>} line2 直线2（两点式）
 * @returns {bool, Array<number, number>} 是否有交点，交点 [x, y]
 */
function findIntersection(line1, line2) {
    const [x1, y1] = line1[0];
    const [x2, y2] = line1[1];
    const [x3, y3] = line2[0];
    const [x4, y4] = line2[1];

    const origin = new Vector(x1, y1, 0, 0);
    const v1 = new Vector(x2 - x1, y2 - y1, 0, 0);
    const v2 = new Vector(x4 - x3, y4 - y3, 0, 0);
    const v3 = new Vector(x3 - x1, y3 - y1, 0, 0);

    const det = cross2d(v1, v2);

    const has_intersection = det !== 0;
    let coord = [0, 0];
    if (has_intersection) {
        const t = cross2d(v3, v2) / det;

        const res = add(origin, multiply(t, v1));
        coord = [res.x, res.y];
    }

    return { has_intersection, point: coord };
}

/**
 * 计算多条直线的交点，取中位数作为V点
 * @param {Array<Array<number, number>>} lines 多条直线（两点式）
 * @returns {bool, Array<number, number>} 是否有交点，交点[x, y]
 */
function getVPoint(lines) {
    var points = [];
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            // 计算两直线交点
            const res = findIntersection(lines[i], lines[j]);
            if (!res.has_intersection) {
                continue;
            }
            points.push(res.point);
        }
    }

    const are_points_non_empty = points.length > 0;
    let coord = [0, 0];

    if (are_points_non_empty) {
        // 求points中位数
        const x_list = points.map((p) => p[0]);
        const y_list = points.map((p) => p[1]);
        const avg_x = calculateMedian(x_list);
        const avg_y = calculateMedian(y_list);
        coord = [avg_x, avg_y];
    }
    return { has_vpoint: are_points_non_empty, vpoint: coord };
}

export { getVPoint };
