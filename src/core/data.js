/** 一颗星星 */
class Star {
    x; y;
    name;
    lat; lon;
    /**
     * @param {number} x 照片上横坐标
     * @param {number} y 照片上纵坐标
     * @param {string} name 星星名字
     * @param {number} lat GP 纬度（弧度制）
     * @param {number} lon GP 经度（弧度制）
     */
    constructor(x, y, name, lat, lon) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.lat = lat;
        this.lon = lon;
    }
};


export { Star };
