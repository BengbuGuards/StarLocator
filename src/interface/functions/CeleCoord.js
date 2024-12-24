import { BACKEND_API } from '../../config.js';
import { postJSON, setHADE } from '../utils.js';

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

        // 开始计算
        let [results, detail] = await postJSON(`${BACKEND_API}/astrocoord`, {
            starNames: starNames,
            timestamp: timestamp,
        });
        if (results === null) {
            this.interactPhoto.tips.innerHTML = `自动计算天体坐标失败：${detail}`;
            return -1;
        }

        this.interactPhoto.tips.innerHTML = `自动计算天体坐标成功`;
        for (let i = 0; i < starNames.length; i++) {
            let [ha, dec] = results['haDecs'][starNames[i]];
            if (isNaN(ha) || isNaN(dec)) {
                this.interactPhoto.tips.innerHTML = `无法自动计算${starNames[i]}坐标，请检查天体名称是否正确`;
                return -1;
            } else {
                setHADE(i + 1, 360 - ha * 15, dec); // 时角变参考时角
            }
        }

        return 0;
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
