import { AstroCalculator } from '../AstroCoord/calc.js';

let starNames = ['北落师门', '火鸟六', '土司空', '室宿一', '危宿三', '月球'];

let date = new Date('2024-10-14T16:00:00Z');

let astroCalculator = new AstroCalculator();
astroCalculator.getHaDecbyNames(starNames, date).then((results) => {
    for (let [name, [ha, dec]] of results) {
        console.log(`The hour angle of ${name} is ${ha} h, and the declination is ${dec} degrees.`);
    }
});

// 等待异步操作完成后再次查询，验证缓存功能
setTimeout(() => {
    console.log('Again');
    astroCalculator.getHaDecbyNames(starNames, date).then((results) => {
        for (let [name, [ha, dec]] of results) {
            console.log(`The hour angle of ${name} is ${ha} h, and the declination is ${dec} degrees.`);
        }
    });
}, 3000);
