import { getHaDecbyNames } from '../AstroCoord/calc.js';

let starNames = ['16 Boo', "venus"];

let date = new Date("2024-10-06T14:00:00Z");
getHaDecbyNames(starNames, date).then(results => {
    for (let [name, [ha, dec]] of results) {
        console.log(`The hour angle of ${name} is ${ha} degrees, and the declination is ${dec} degrees.`);
    }
});