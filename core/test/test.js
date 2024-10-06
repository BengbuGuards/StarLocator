import { markStars } from "../mark.js";
import { getZ } from "../getZ.js";
import { calc } from "../calc.js";

/**
 * 若干个星星的原始数据
*/
const originalStars = [
    [
        [-1683.36, -533.43, '五车二', '11h21m2.32s', '+46°1\'15.2"'],
        [-872.94, 154.75, '五车五', '11h11m42.38s', '+28°37\'40.9"'],
        [13.51, -9.10, '毕宿五', '12h2m13.01s', '+16°33\'36.9"'],
        [913.56, 1179.38, '参宿七', '11h23m50.23s', '-8°10\'9.6"'],
        [1248.88, -813.42, '天囷一', '13h35m58.87s', '+4°11\'20.8"']
    ],
    [
        [-318.37, -366.77, '土司空', '15h54m43.60s', '-17°50\'55.3"'],
        [-912.40, -890.96, '天仓三', '15h14m17.76s', '-8°3\'9.7"'],
        [-15.31, -873.57, '天仓一', '16h18m52.15s', '-8°41\'5.3"'],
        [947.26, 321.65, '北落师门', '17h40m32.44s', '-29°29\'27.2"'],
        [1217.42, -913.35, '垒壁阵七', '17h45m39.36s', '-7°26\'47.7"']
    ], 
    [
        [-1201.17, -1819.50, '虚宿二',	'19h22m30.01s',	'+5°21\'7.5"'],
        [-361.46, -1706.09, '瓠瓜二',	'19h51m46.58s',	'+16°0\'7.2"'],
        [1124.82, -6691.48, 'ο And',	'17h36m29.46s',	'+42°27\'41.6"'],
        [-629.95, -6035.47, '室宿二',	'17h34m34.77s',	'+28°13\'10.7"'],
        [663.58, -2323.9, '天津九',	'19h52m21.03s',	'+34°3\'58.9"']
    ]
]

const geoTargets = [
    [34.999625, 115],
    [34.999625, 115],
    [34.999625, 115]
]

const zeniths = [
    [0, -5196.15],
    [0, -5196.15],
    [0, -17013.85]
]

let errors = [];
for (let i = 0; i < originalStars.length; i++) {
    let stars = markStars(originalStars[i]);
    console.log("stars: ", stars);

    let z = getZ(stars, zeniths[i], true);  // 使用大气折射修正
    // let z = getZ(stars, zeniths[i], false);  // 不使用大气折射修正
    console.log("z: ", z);

    let geoEstimate = calc(stars, z, zeniths[i], true, true);  // 使用重力修正和大气折射修正
    // let geoEstimate = calc(stars, z, zeniths[i]);  // 不使用重力修正和大气折射修正
    console.log("geoEstimate", geoEstimate);
    
    let error = Math.sqrt((geoEstimate[0] - geoTargets[i][0]) ** 2 + (geoEstimate[1] - geoTargets[i][1]) ** 2);
    errors.push(error);
    console.log("error: ", error);
}

// 求平均误差
let sum = 0;
for (let error of errors) {
    sum += error;
}
let avg = sum / errors.length;
console.log("average error: ", avg);