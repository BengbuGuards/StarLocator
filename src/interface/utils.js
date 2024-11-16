// 获取原始星星数据
function getOriginalStars(interactPhoto) {
    let stars = [];
    for (let i = 1; i <= interactPhoto.CeleArray.num(); i++) {
        let coordX = parseFloat(document.getElementById(`coordX${i}`).value);
        let coordY = parseFloat(document.getElementById(`coordY${i}`).value);
        let name = document.getElementById(`name${i}`).value;
        let hAngleH = document.getElementById(`hAngleH${i}`).textContent;
        let hAngleM = document.getElementById(`hAngleM${i}`).textContent;
        let hAngleS = document.getElementById(`hAngleS${i}`).textContent;
        let declinD = document.getElementById(`declinD${i}`).textContent;
        let declinM = document.getElementById(`declinM${i}`).textContent;
        let declinS = document.getElementById(`declinS${i}`).textContent;
        stars.push([
            coordX,
            coordY,
            name,
            hAngleH === '' || hAngleM === '' || hAngleS === '' ? '' : hAngleH + 'h' + hAngleM + 'm' + hAngleS + 's',
            declinD === '' || declinM === '' || declinS === '' ? '' : declinD + '°' + declinM + "'" + declinS + '"',
        ]);
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

export { getOriginalStars, getGlobalPLPointsCoord };
