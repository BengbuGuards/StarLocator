// 获取原始星星数据
function getOriginalStars(interactPhoto) {
    let stars = [];
    for (let i = 1; i <= interactPhoto.CeleArray.num(); i++) {
        const coordXInput = document.getElementById(`coordX${i}`);
        const coordYInput = document.getElementById(`coordY${i}`);
        let coordX = parseFloat(coordXInput.dataset.rawValue ?? coordXInput.value);
        let coordY = parseFloat(coordYInput.dataset.rawValue ?? coordYInput.value);
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
    const totalRows = interactPhoto.PLArray.tablePLRowCount();
    for (let i = 1; i <= totalRows; i++) {
        const x1 = parseFloat(document.getElementById(`pl${i}_x1`)?.value);
        const y1 = parseFloat(document.getElementById(`pl${i}_y1`)?.value);
        const x2 = parseFloat(document.getElementById(`pl${i}_x2`)?.value);
        const y2 = parseFloat(document.getElementById(`pl${i}_y2`)?.value);
        if (Number.isFinite(x1) && Number.isFinite(y1) && Number.isFinite(x2) && Number.isFinite(y2)) {
            globalPLPointsCoord.push([
                [x1, y1],
                [x2, y2],
            ]);
        }
    }
    return globalPLPointsCoord;
}

// 设置参考时角和赤纬，将角度数值化为度/时分秒形式
function setHADE(id, hourAngle, declination) {
    const rawHourAngle = hourAngle;
    const rawDeclination = declination;

    let sign = hourAngle < 0 ? '-' : '';
    hourAngle = Math.abs(hourAngle) / 15;
    document.getElementById(`hAngleH${id}`).textContent = sign + parseInt(hourAngle);
    hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
    document.getElementById(`hAngleM${id}`).textContent = parseInt(hourAngle);
    hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
    const hAngleS = document.getElementById(`hAngleS${id}`);
    hAngleS.textContent = roundTo(hourAngle, 2);
    hAngleS.dataset.rawValue = rawHourAngle;

    sign = declination < 0 ? '-' : '';
    declination = Math.abs(declination);
    document.getElementById(`declinD${id}`).textContent = sign + parseInt(declination);
    declination = (declination - parseInt(declination)) * 60;
    document.getElementById(`declinM${id}`).textContent = parseInt(declination);
    declination = (declination - parseInt(declination)) * 60;
    const declinS = document.getElementById(`declinS${id}`);
    declinS.textContent = roundTo(declination, 2);
    declinS.dataset.rawValue = rawDeclination;
}

// 转换参考时角和赤纬，将度/时分秒形式转化为角度数值
function getHADE(id) {
    const hAngleSInput = document.getElementById(`hAngleS${id}`);
    const declinSInput = document.getElementById(`declinS${id}`);
    const rawHourAngle = parseFloat(hAngleSInput.dataset.rawValue);
    const rawDeclination = parseFloat(declinSInput.dataset.rawValue);

    if (
        Number.isFinite(rawHourAngle) &&
        Number.isFinite(rawDeclination) &&
        isDisplayedHADEUnchanged(id, rawHourAngle, rawDeclination)
    ) {
        return [rawHourAngle, rawDeclination];
    }

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

function roundTo(num, digits) {
    const tmp = 10 ** digits;
    return Math.round(num * tmp) / tmp;
}

function formatHADE(hourAngle, declination) {
    let sign = hourAngle < 0 ? '-' : '';
    hourAngle = Math.abs(hourAngle) / 15;
    const hAngleH = sign + parseInt(hourAngle);
    hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
    const hAngleM = String(parseInt(hourAngle));
    hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
    const hAngleS = String(roundTo(hourAngle, 2));

    sign = declination < 0 ? '-' : '';
    declination = Math.abs(declination);
    const declinD = sign + parseInt(declination);
    declination = (declination - parseInt(declination)) * 60;
    const declinM = String(parseInt(declination));
    declination = (declination - parseInt(declination)) * 60;
    const declinS = String(roundTo(declination, 2));

    return { hAngleH, hAngleM, hAngleS, declinD, declinM, declinS };
}

function isDisplayedHADEUnchanged(id, hourAngle, declination) {
    const displayed = formatHADE(hourAngle, declination);
    return (
        document.getElementById(`hAngleH${id}`).textContent === displayed.hAngleH &&
        document.getElementById(`hAngleM${id}`).textContent === displayed.hAngleM &&
        document.getElementById(`hAngleS${id}`).textContent === displayed.hAngleS &&
        document.getElementById(`declinD${id}`).textContent === displayed.declinD &&
        document.getElementById(`declinM${id}`).textContent === displayed.declinM &&
        document.getElementById(`declinS${id}`).textContent === displayed.declinS
    );
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
