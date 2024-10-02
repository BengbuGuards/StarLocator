const sin = Math.sin;
const cos = Math.cos;


/** 三维向量 */
class Vector {
    x; y; z;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * 将 GP 转化为单位方向向量
     * @param {number} lat 纬度（弧度制）
     * @param {number} lon 经度（弧度制）
     * @returns {Vector} 一个向量对象
     */
    static fromGP(lat, lon) {
        return new Vector(
            cos(lat) * cos(lon),
            cos(lat) * sin(lon),
            sin(lat)
        );
    }

    /**
     * 获取该向量的模长
     * @returns {number}
     */
    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
};


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
 * 计算向量夹角（弧度制）
 * @param {Vector} v1
 * @param {Vector} v2
 * @returns {number}
 */
function vectorAngle(v1, v2) {
    return Math.acos(dot(v1, v2) / (v1.norm() * v2.norm()));
}


export { Vector, vectorAngle };
