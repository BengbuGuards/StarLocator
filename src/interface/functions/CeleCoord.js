import { MakeTime, Observer } from 'astronomy-engine';
import { setHADE } from '../utils.js';
import { getRaDecByName, getHaDecByRaDec, getHaDecInSolar } from '../AstroService.js';

// 计算天体坐标功能类
class CeleCoord {
    constructor(interactPhoto) {
        this.interactPhoto = interactPhoto;
    }

    async calc() {
        // 读取数据
        let starNames = this.getStarNames();
        let timestamp = this.interactPhoto.getTimestamp();

        // 检查是否有未填写的天体名称
        if (starNames === null) {
            this.interactPhoto.tips.innerHTML = `请填写所有天体名称`;
            return -1;
        }

        this.interactPhoto.tips.innerHTML = `正在本地计算天体坐标...`;

        const astTime = MakeTime(new Date(timestamp * 1000));
        const observer = new Observer(0, 0, 0);

        try {
            for (let i = 0; i < starNames.length; i++) {
                const name = starNames[i];
                const info = await getRaDecByName(name);
                if (!info) {
                    this.interactPhoto.tips.innerHTML = `无法自动计算 ${name} 坐标，请检查天体名称是否正确或网络是否连接`;
                    return -1;
                }

                let ha, dec;
                if (info.isSolar) {
                    [ha, dec] = getHaDecInSolar(info.name, astTime, observer);
                } else {
                    [ha, dec] = getHaDecByRaDec(info.ra, info.dec, astTime, observer);
                }

                if (!Number.isFinite(ha) || !Number.isFinite(dec)) {
                    this.interactPhoto.tips.innerHTML = `无法自动计算 ${name} 坐标，数值异常`;
                    return -1;
                }

                setHADE(i + 1, 360 - ha * 15, dec); // 时角变参考时角
            }
            this.interactPhoto.tips.innerHTML = `自动计算天体坐标成功`;
            return 0;
        } catch (e) {
            const errorMsg = e.message || e;
            this.interactPhoto.tips.innerHTML = `自动计算天体坐标失败：${errorMsg}`;
            return -1;
        }
    }

    getStarNames() {
        let starNames = [];
        for (let i = 1; i <= this.interactPhoto.CeleArray.num(); i++) {
            if (document.getElementById(`name${i}`).value === '') {
                return null;
            }
            starNames.push(document.getElementById(`name${i}`).value);
        }
        return starNames;
    }
}

export { CeleCoord };
