import { markStars } from '../mark.js';
import { getZ } from '../getZ.js';
import { calc } from '../MoonTime/calc.js';
import { findMoonIndex } from '../MoonTime/utils.js';
import { AstroCalculator } from '../AstroCoord/calc.js';

const originalStars = [
    [-456, 226, '北落师门', '18h35m44s', '-29°29\'24.19"'],
    [-1771, 226, '火鸟六', '17h7m13.75s', '-42°10\'6.458"'],
    [-1190, -1129, '土司空', '16h49m54.67s', '-17°50\'57.62"'],
    [1240, -1817, '室宿一', '18h28m45.11s', '15°20\'28.78"'],
    [1879, -685, '危宿三', '19h49m20.97s', '9°59\'26.87"'],
    // [287,    -528, "月", "18h32m54.39s", "-9°1'6.281\""]
    [285, -530, '月', '18h32m54.39s', '-9°1\'6.281"'],
];
// 2024-10-15 00:00:00

const stars = markStars(originalStars);
const zenith = [0, -5196.15];
const z = getZ(
    stars.filter((star, index) => index !== findMoonIndex(stars)), // 注意用除月外的星星算
    zenith,
    false
);
const approxDate = new Date(2024, 9, 15); // 2024-10-15
const scopeDate = 30;
const astroCalculator = new AstroCalculator();

calc(stars, z, zenith, approxDate, scopeDate, astroCalculator, false, false).then((date) => {
    console.log(date);
});
