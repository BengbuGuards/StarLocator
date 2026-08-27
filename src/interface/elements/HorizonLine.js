import { PLpoint, PLArray } from './PlumbLine.js';

// 地平线端点类（几何与铅垂线端点一致，仅标记语义不同）
class HLpoint extends PLpoint {}

// 地平线数组类（复用铅垂线的两点线段交互，仅颜色不同）
class HLArray extends PLArray {
    constructor(interactPhoto) {
        super(interactPhoto, HLpoint, '#ffb703');
    }
}

export { HLpoint, HLArray };
