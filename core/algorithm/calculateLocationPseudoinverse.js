// 弧度转角度
function rad2Deg(radians) {
    return radians * (180 / Math.PI);
}

// 角度转弧度
function deg2Rad(degrees) { 
    return degrees * (Math.PI / 180);
}

// 矩阵转置
function transposeMatrix(matrix) {
    let transposedMatrix = [];
    for (let i = 0; i < matrix[0].length; i++) {
        transposedMatrix[i] = [];
        for (let j = 0; j < matrix.length; j++) {
            transposedMatrix[i][j] = matrix[j][i];
        }
    }
    return transposedMatrix;
}

/**
 * 使用伪逆方法计算位置
 * @param {Array<Star>} stars GP 星体数组
 * @param {Array<number>} zenithAngles 理论天顶角（角度制）
 * @returns 通过 Moore-Penrose 伪逆计算的经纬度
 */
function calculateLocationPseudoinverse(crudePositions, stars, zenithAngles) {
    // 构造矩阵A，每行是GP星体的单位向量
    let A = stars.map(star => {
        let vector = Astronomy.VectorFromSphere(new Astronomy.Spherical(rad2Deg(star.lat), rad2Deg(star.lon), 1), 0);
        return [vector.x, vector.y, vector.z];
    });

    // 构造向量B，其值为天顶角的余弦
    let B = zenithAngles.map(angle => Math.cos(deg2Rad(angle)));

    // 求A伪逆
    let A_pseudo = math.pinv(A)

    // 计算x
    let x = math.multiply(A_pseudo, B);

    // 归一化x
    let magnitude = Math.sqrt(x[0]**2 + x[1]**2 + x[2]**2);
    x = x.map(val => val / magnitude);

    // 将单位向量x转换回经纬度
    let sphericalCoords = Astronomy.SphereFromVector({x: x[0], y: x[1], z: x[2]});
   
    return [sphericalCoords.lat, sphericalCoords.lon];
}

export { calculateLocationPseudoinverse };