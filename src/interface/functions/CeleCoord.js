// 计算天体坐标按钮功能类
class CeleCoord {
    constructor(interactPhoto, astroCalculator){
        this.interactPhoto = interactPhoto;
        this.astroCalculator = astroCalculator;
    }

    async calc() {
        // 读取数据
        let starNames = this.getStarNames();
        let date = this.interactPhoto.getDateTime();

        // 检查是否有未填写的天体名称
        if(starNames === null) {
            this.interactPhoto.tips.innerHTML = `请填写所有天体名称`;
            return -1;
        }

        // 开始计算
        let results = await this.astroCalculator.getHaDecbyNames(starNames, date);
        this.interactPhoto.tips.innerHTML = `自动计算天体坐标成功`;
        for (let i = 0; i < starNames.length; i++) {
            let [ha, dec] = results.get(starNames[i]);
            if (isNaN(ha) || isNaN(dec)) {
                this.interactPhoto.tips.innerHTML = `无法自动计算${starNames[i]}坐标，请检查天体名称是否正确`;
                return -1;
            } else {
                this.setHADE(i+1, ha, dec);
            }
        }

        return 0;
    }

    getStarNames() {
        let starNames = [];
        for(let i = 1; i <= this.interactPhoto.CeleArray.num(); i++){
            if(document.getElementById(`name${i}`).value === '') {
                return null;
            }
            starNames.push(document.getElementById(`name${i}`).value);
        }
        return starNames;
    }

    setHADE(id, hourAngle, declination) {
        let sign = (hourAngle < 0 ? '-' : '');
        hourAngle = Math.abs(hourAngle);
        document.getElementById(`hAngleH${id}`).textContent = sign + parseInt(hourAngle);
        hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
        document.getElementById(`hAngleM${id}`).textContent = parseInt(hourAngle);
        hourAngle = (hourAngle - parseInt(hourAngle)) * 60;
        document.getElementById(`hAngleS${id}`).textContent = hourAngle;

        sign = (declination < 0 ? '-' : '');
        declination = Math.abs(declination);
        document.getElementById(`declinD${id}`).textContent = sign + parseInt(declination);
        declination = (declination - parseInt(declination)) * 60;
        document.getElementById(`declinM${id}`).textContent = parseInt(declination);
        declination = (declination - parseInt(declination)) * 60;
        document.getElementById(`declinS${id}`).textContent = declination;
    }
}


export { CeleCoord };