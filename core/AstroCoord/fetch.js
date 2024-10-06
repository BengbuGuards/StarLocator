import { solarBodies } from './calc.js';


/**
 * 根据恒星名称获取其赤经和赤纬
 * @param {string} starName 恒星名称
 * @returns {Promise<[number, number]>} 返回一个Promise对象，包含赤经和赤纬J2000
 */
async function getRaDeCbyName(starName) {
    // 不查询太阳系天体
    if (solarBodies.includes(starName)) {
        return [NaN, NaN];
    }

    starName = starName.replace(/\s+/, '+');

    let results = await fetch(
        'https://simbad.cds.unistra.fr/simbad/sim-id?output.format=ASCII&Ident='
        + starName
        + '&obj.coo2=off&obj.coo3=off&obj.coo4=off'
        + '&obj.pmsel=off&obj.plxsel=off&obj.rvsel=off&obj.spsel=off&obj.mtsel=off'
        + '&obj.sizesel=off&obj.fluxsel=off&obj.bibsel=off&list.bibsel=off&obj.messel=off&obj.notesel=off', {
        method: 'GET',
    })
    .then(response => response.text()) // 解析响应体为JSON格式
    .then(data => {
        // 解析数据
        let regrx = /Coordinates\(ICRS,ep=J2000,eq=2000\):(\s*[+-\d.]*){6}/;
        let line = data.match(regrx)[0];
        let parts = line.split(' ').filter(part => part !== '').slice(1, 7).map(part => parseFloat(part));
        // 处理数据
        if (parts[3] < 0) {
            parts[4] *= -1;
            parts[5] *= -1;
        }
        let ra = parts[0] + parts[1] / 60 + parts[2] / 3600;
        let dec = parts[3] + parts[4] / 60 + parts[5] / 3600;
        return [ra, dec];
    })
    .catch(error => {
        console.error('Error:', error);
        return [NaN, NaN];
    }); // 捕获错误

    return results;
}

/**
 * 根据恒星名称获取其时角和赤纬
 * @param {string} starName 恒星名称
 * @returns {Promise<[number, number]>} 返回一个Promise对象，包含时角和赤纬J2000
 */
async function getRaDecbyNames(starNames) {
    // 异步获取恒星的赤经和赤纬
    let raDecs = starNames.map(async starName => {
        let raDec = await getRaDeCbyName(starName);
        return raDec;
    });
    raDecs = await Promise.all(raDecs);
    return raDecs;
}


export { getRaDecbyNames };