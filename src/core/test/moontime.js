import { calc } from '../MoonTime/calc.js';
import { markStars } from "../mark.js";
import { AstroCalculator } from '../AstroCoord/calc.js';

const originalStars = [
    [-456.1113994,    226.3578292, "北落师门", "18h35m44s", "-29°29'24.19\""],
    [-1770.586852,    225.8784947, "火鸟六", "17h7m13.75s", "-42°10'6.458\""],
    [-1189.988093,    -1128.605151, "土司空", "16h49m54.67s", "-17°50'57.62\""],
    [1239.9735,    -1816.574454, "室宿一", "18h28m45.11s", "15°20'28.78\""],
    [1879.413387,    -685.130921, "危宿三", "19h49m20.97s", "9°59'26.87\""],
    [286.8341134,    -528.2279682, "月", "18h32m54.39s", "-9°1'6.281\""]
];
// 2024-10-15 00:00:00

const z = 3000;
const zenith = [0, -5196.15];
const approxDate = new Date(2024, 4, 1);  // 2024-5-1
const scopeDate = 365;
const astroCalculator = new AstroCalculator();

let stars = markStars(originalStars);
calc(stars, z, zenith, approxDate, scopeDate, astroCalculator, false, false).then(date => {
    console.log(date);
});