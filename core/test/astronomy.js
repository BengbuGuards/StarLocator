import { AstroCalculator } from '../AstroCoord/calc.js';

let starNames = ['16 Boo', "金星", "角宿一", "月球"];

let date = new Date("2024-10-06T14:00:00Z");

let astroCalculator = new AstroCalculator();
astroCalculator.getHaDecbyNames(starNames, date).then(results => {
    for (let [name, [ha, dec]] of results) {
        console.log(`The hour angle of ${name} is ${ha} h, and the declination is ${dec} degrees.`);
    }
});