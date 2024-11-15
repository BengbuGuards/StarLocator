import { calculateMedian } from '../math.js';

/**
 * 计算多条直线的交点，取中位数作为V点
 * @param {Array<Array<number, number>>} lines 多条直线（两点式）
 * @returns {Array<number, number>} 交点x, y
 */
function getVPoint(lines) {
    var points = [];
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            // 计算两直线交点
            let [x1, y1] = lines[i][0];
            let [x2, y2] = lines[i][1];
            let [x3, y3] = lines[j][0];
            let [x4, y4] = lines[j][1];
            if ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4) === 0) {
                continue;
            }
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            x /= (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            y /= (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            points.push([x, y]);
        }
    }
    // 求points中位数
    let x_list = points.map((p) => p[0]);
    let y_list = points.map((p) => p[1]);
    let avg_x = calculateMedian(x_list);
    let avg_y = calculateMedian(y_list);
    return [avg_x, avg_y];
}

export { getVPoint };
