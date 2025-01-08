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
            lon: (getHADE(i)[0] / 180) * Math.PI,
            lat: (getHADE(i)[1] / 180) * Math.PI,
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

// 设置参考时角和赤纬，将角度数值化为度/时分秒形式
function setHADE(id, hourAngle, declination) {
    let sign = hourAngle < 0 ? '-' : '';
    hourAngle = Math.abs(hourAngle) / 15;
    document.getElementById(`hAngleH${id}`).textContent = sign + parseInt(hourAngle);
    hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
    document.getElementById(`hAngleM${id}`).textContent = parseInt(hourAngle);
    hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
    document.getElementById(`hAngleS${id}`).textContent = hourAngle;

    sign = declination < 0 ? '-' : '';
    declination = Math.abs(declination);
    document.getElementById(`declinD${id}`).textContent = sign + parseInt(declination);
    declination = (declination - parseInt(declination)) * 60;
    document.getElementById(`declinM${id}`).textContent = parseInt(declination);
    declination = (declination - parseInt(declination)) * 60;
    document.getElementById(`declinS${id}`).textContent = declination;
}

// 转换参考时角和赤纬，将度/时分秒形式转化为角度数值
function getHADE(id) {
    let hAngleH = parseInt(document.getElementById(`hAngleH${id}`).textContent);
    let hAngleM = parseInt(document.getElementById(`hAngleM${id}`).textContent);
    let hAngleS = parseFloat(document.getElementById(`hAngleS${id}`).textContent);
    let hourSign = hAngleH < 0 ? -1 : 1;
    let declinD = parseInt(document.getElementById(`declinD${id}`).textContent);
    let declinM = parseInt(document.getElementById(`declinM${id}`).textContent);
    let declinS = parseFloat(document.getElementById(`declinS${id}`).textContent);
    let decSign = declinD < 0 ? -1 : 1;
    let hourAngle = hourSign * (Math.abs(hAngleH) + hAngleM / 60 + hAngleS / 3600) * 15;
    let declination = decSign * (Math.abs(declinD) + declinM / 60 + declinS / 3600);
    return [hourAngle, declination];
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

export { getOriginalStars, getGlobalPLPointsCoord, post, setHADE, getHADE };
