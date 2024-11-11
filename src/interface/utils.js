// 获取原始星星数据
function getOriginalStars(interactPhoto) {
    let stars = [];
    for (let i = 1; i <= interactPhoto.CeleArray.num(); i++) {
        let star = [
            parseFloat(document.getElementById(`coordX${i}`).value),
            parseFloat(document.getElementById(`coordY${i}`).value),
            document.getElementById(`name${i}`).value,
            document.getElementById(`hAngleH${i}`).textContent + 'h' +
            document.getElementById(`hAngleM${i}`).textContent + 'm' +
            document.getElementById(`hAngleS${i}`).textContent + 's',
            document.getElementById(`declinD${i}`).textContent + '°' +
            document.getElementById(`declinM${i}`).textContent + '\'' +
            document.getElementById(`declinS${i}`).textContent + '"'
        ];
        if (star[0] && star[1] && star[2] && star[3] && star[4]) {
            stars.push(star);
        }
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