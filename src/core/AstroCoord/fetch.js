import { solarBodies } from './calc.js';

/**
 * 根据恒星名称获取其赤经和赤纬
 * @param {string} starName 恒星名称
 * @returns {Promise<[number, number]>} 返回一个Promise对象，包含J2000的赤经（时）和赤纬（度）
 */
async function getRaDecbyName(starName) {
    // 不查询太阳系天体
    if (solarBodies.includes(starName)) {
        return [NaN, NaN];
    }

    starName = starName.replace(/\s+/, '+');

    let results = await fetch(
        'https://simbad.u-strasbg.fr/simbad/sim-nameresolver?ident=' + starName + '&output=json&data=J&option=strict',
        {
            method: 'GET',
        }
    )
        .then((response) => response.json()) // 解析响应体为JSON格式
        .then((data) => {
            let ra = data[0]['ra'] / 15;
            let dec = data[0]['dec'];
            return [ra, dec];
        })
        .catch((error) => {
            console.error('Error:', error);
            return [NaN, NaN];
        }); // 捕获错误

    return results;
}

/**
 * 根据恒星名称获取其时角和赤纬
 * @param {Array} starName 恒星名称
 * @returns {Promise<[number, number]>} 返回一个Promise对象，包含时角和赤纬J2000
 */
async function getRaDecbyNames(starNames) {
    // 异步获取恒星的赤经和赤纬
    let raDecs = starNames.map(async (starName) => {
        let raDec = await getRaDecbyName(starName);
        return raDec;
    });
    raDecs = await Promise.all(raDecs);
    return raDecs;
}

export { getRaDecbyNames };
