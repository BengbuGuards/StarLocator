// 获取原始星星数据
function getOriginalStars(interactPhoto) {
    let stars = [];
    for (let i = 1; i <= interactPhoto.CeleArray.num(); i++) {
        let coordX = parseFloat(document.getElementById(`coordX${i}`).value);
        let coordY = parseFloat(document.getElementById(`coordY${i}`).value);
        let name = document.getElementById(`name${i}`).value;
        stars.push({
            x: coordX,
            y: coordY,
            name: name,
            lon: (interactPhoto.CeleArray[i].hAngle / 180) * Math.PI,
            lat: (interactPhoto.CeleArray[i].declin / 180) * Math.PI,
        });
    }
    return stars;
}

// 获取铅垂线端点坐标
function getGlobalPLPointsCoord(interactPhoto) {
    let globalPLPointsCoord = [];
    for (let i = 0; i < interactPhoto.PLArray.num(); i++) {
        let pl = interactPhoto.PLArray.array[i];
        let points = [];
        for (let j = 0; j < pl.points.length; j++) {
            points.push(pl.points[j].coordinate);
        }
        globalPLPointsCoord.push(points);
    }
    return globalPLPointsCoord;
}

/**
 * 计算参考时角，将角度数值化为度/时分秒形式
 * @param {Number} hourAngle 参考时角，单位：度
 * @returns {Array} [时, 分, 秒]，都是字符串
 */
function hourAngleFormat(hourAngle) {
    if (isNaN(hourAngle)) {
        return ['', '', ''];
    }
    let sign = hourAngle < 0 ? '-' : '';
    hourAngle = Math.abs(hourAngle) / 15;
    let resultFormated = [];
    let hoursInt = parseInt(hourAngle);
    resultFormated.push(sign + hoursInt.toString());
    hourAngle = (hourAngle - hoursInt) * 60;
    let minutesInt = parseInt(hourAngle);
    resultFormated.push(minutesInt.toString());
    hourAngle = (hourAngle - minutesInt) * 60;
    resultFormated.push(hourAngle.toString());
    return resultFormated;
}

/**
 * 计算赤纬，将角度数值化为度/时分秒形式
 * @param {Number} declination 赤纬，单位：度
 * @returns {Array} [度, 分, 秒]，都是字符串
 */
function declinFormat(declination) {
    if (isNaN(declination)) {
        return ['', '', ''];
    }
    let sign = declination < 0 ? '-' : '';
    declination = Math.abs(declination);
    let degrees = parseInt(declination);
    declination = (declination - degrees) * 60;
    let minutes = parseInt(declination);
    declination = (declination - minutes) * 60;
    let seconds = declination;
    let resultFormated = [];
    resultFormated.push(sign + degrees.toString());
    resultFormated.push(minutes.toString());
    resultFormated.push(seconds.toString());
    return resultFormated;
}

/**
 * 转换参考时角，将度/时分秒形式转化为角度数值
 * @param {Array} hourAngleFormated [时, 分, 秒]，都是字符串
 * @returns {Number} 参考时角，单位：度
 */
function hourAngleUnformat(hourAngleFormated) {
    let hourAngle = 0;
    for (let i = 0; i < hourAngleFormated.length; i++) {
        hourAngle += parseFloat(hourAngleFormated[i]) / Math.pow(60, i);
    }
    hourAngle *= 15;
    if (hourAngleFormated[0].startsWith('-')) {
        hourAngle *= -1;
    }
    return hourAngle;
}

/**
 * 转换赤纬，将度/时分秒形式转化为角度数值
 * @param {Array} declinFormated [度, 分, 秒]，都是字符串
 * @returns {Number} 赤纬，单位：度
 */
function declinUnformat(declinFormated) {
    let declination = 0;
    for (let i = 0; i < declinFormated.length; i++) {
        declination += parseFloat(declinFormated[i]) / Math.pow(60, i);
    }
    if (declinFormated[0].startsWith('-')) {
        declination *= -1;
    }
    return declination;
}

// json数据的POST请求
async function post(url, data, Type) {
    try {
        let response;
        if (Type === 'form') {
            let formData = new FormData();
            for (let key in data) {
                if (data[key] instanceof Array) {
                    for (let item of data[key]) {
                        formData.append(key, item);
                    }
                } else {
                    formData.append(key, data[key]);
                }
            }
            response = await fetch(url, {
                method: 'POST',
                body: formData,
            });
        } else if (Type === 'json') {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } else {
            throw new Error('Invalid POST request type');
        }
        let results = await response.json();
        let detail = results?.detail ?? 'success';
        if (!response.ok) {
            results = null;
            detail = results?.detail ?? `HTTP ${response.status}`;
        }
        return [results, detail];
    } catch (error) {
        console.error(error.message);
        return [null, error.message];
    }
}

export {
    getOriginalStars,
    getGlobalPLPointsCoord,
    post,
    hourAngleFormat,
    declinFormat,
    hourAngleUnformat,
    declinUnformat,
};
