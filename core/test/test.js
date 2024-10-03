import { markStars } from "../mark.js";
import { getZ } from "../getZ.js";
import { calc } from "../calc.js";

const originalStars = [
    [-384, -364.5, '昴宿六', '14h49m44.14s', ' +24°10\'46.5"'],
    [44, -130.5, '木星', '16h04m10.53s', '+13°39\'15.2"'],
    [-97, 97.5, '天囷一', '15h35m06.71s', '+4°11\'04.5"'],
    [13, 106.5, '天囷八', '15h54m06.05s', '+3°20\'16.6"'],
    [-412, 580.5, '天苑一', '14h39m29.71s', '-13°26\'19.1"']
]

let stars = markStars(originalStars);
console.log(stars);

let z = getZ(stars);
console.log(z);

const zenith = [-135.73551348, -852.60276501]

console.log(calc(stars, z, zenith));
