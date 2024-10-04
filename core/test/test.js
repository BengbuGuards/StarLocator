import { markStars } from "../mark.js";
import { getZ } from "../getZ.js";
import { calc } from "../calc.js";

const originalStars = [
    [-1683.36, -533.43, '五车二', '11h21m2.32s', '+46°1\'15.2"'],
    [-872.94, 154.75, '五车五', '11h11m42.38s', '+28°37\'40.9"'],
    [13.51, -9.10, '毕宿五', '12h2m13.01s', '+16°33\'36.9"'],
    [913.56, 1179.38, '参宿七', '11h23m50.23s', '-8°10\'9.6"'],
    [1248.88, -813.42, '天囷一', '13h35m58.87s', '+4°11\'20.8"']
]

let stars = markStars(originalStars);
console.log(stars);

let z = getZ(stars);
console.log(z);

const zenith = [0, -5196.15]

console.log(calc(stars, z, zenith));
// 模拟场景理论结果: 115.000000E, 35.000000N
