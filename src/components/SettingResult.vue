<script setup>
import { version } from '/package.json';
defineProps({
    results: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div class="col-result">
        <h2>设置</h2>
        <div>
            <div>
                <input type="checkbox" id="check1" checked />
                <label for="check1" class="tooltip"
                    >大气折射修正<span class="tooltiptext">是否考虑大气折射对各天体地平高度角的影响</span></label
                ><br />
                <input type="checkbox" id="check2" checked />
                <label for="check2" class="tooltip"
                    >重力方向修正<span class="tooltiptext">是否考虑当地的重力方向与天顶方向不重合的影响</span></label
                ><br />
                <input type="checkbox" id="check3" checked />
                <label for="check3" class="tooltip"
                    >自动获取天体坐标<span class="tooltiptext">在计算前自动获取天体坐标</span></label
                ><br />
                <label for="setDate" class="tooltip"
                    >拍摄时间<span class="tooltiptext">时间若无法精确到秒，可以填入30作为尾数</span></label
                >
                <input id="setDate" type="date" style="width: 25%" />
                <input id="setTime" type="time" step="1" style="width: 20%" aria-label="时间" />
                <label for="setTimeZone" class="tooltip">时区<span class="tooltiptext">北京时间为UTC+8</span></label>
                <input id="setTimeZone" type="number" min="-12" max="12" step="0.5" style="width: 10%" /><br />
                <label for="setTimeScope" class="tooltip"
                    >标月定时搜索区间
                    <span class="tooltiptext">以大致的拍摄时间为中心，前后搜索确切拍摄时间的区间大小</span></label
                >
                <input id="setTimeScope" type="number" min="0" value="30" style="width: 8%; text-align: right" />天
                <label for="setStarThresh" class="tooltip" style="padding-left: 8%"
                    >检测星点阈值 <span class="tooltiptext">判断一个光点是否为星的阈值</span></label
                >
                <input id="setStarThresh" type="number" min="0" value="30" style="width: 8%; text-align: right" /><br />
                <label for="setScopeAngle" class="tooltip"
                    >天体识别：视场宽度角估计
                    <span class="tooltiptext">对图片视场宽度角估计其范围，估计越准确求解速度越快</span></label
                >
                <input
                    id="setScopeAngle1"
                    type="number"
                    min="0.1"
                    max="180"
                    value="0.1"
                    style="width: 8%; text-align: right"
                />° —
                <input
                    id="setScopeAngle2"
                    type="number"
                    min="0.1"
                    max="180"
                    value="180"
                    style="width: 8%; text-align: right"
                />°
            </div>
        </div>
        <div style="margin-top: 65px">
            <h2>结果</h2>
            <table style="width: 100%; margin-top: 10px; margin-bottom: 10px">
                <thead>
                    <tr>
                        <th class="tooltip">像素焦距z<span class="tooltiptext">焦平面到光心的像素距离</span></th>
                        <th class="tooltip">
                            35mm焦距<span class="tooltiptext">根据照片的分辨率换算得到的等效焦距</span>
                        </th>
                        <th class="tooltip">
                            经度<span class="tooltiptext">定位点的经度；正值为东经，负值为西经</span>
                        </th>
                        <th class="tooltip">
                            纬度<span class="tooltiptext">定位点的纬度；正值为北纬，负值为南纬</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td id="focLenPix" class="result">{{ results.focLenPix }}</td>
                        <td id="focLenMm" class="result">{{ results.focLenMm }}mm</td>
                        <td id="outputLong" class="result">{{ results.outputLong }}°</td>
                        <td id="outputLat" class="result">{{ results.outputLat }}°</td>
                    </tr>
                </tbody>
            </table>
            <div id="address" style="height: 30px"></div>
            <div id="map" style="min-width: 360px; height: 360px; margin-left: 0px"></div>
        </div>
        <div style="margin-top: 30px">
            <h2>关于</h2>
            <!--TODO: 这里填README相同的注意事项-->
            <div class="row">
                <div class="col-acknow">
                    感谢开源项目（完整名单见<a href="https://github.com/BengbuGuards/StarLocator/blob/main/NOTICE.md"
                        >NOTICE</a
                    >）：
                    <ul>
                        <li><a href="https://stellarium.org">Stellarium</a>：一款强大的开源天文馆软件</li>
                        <li>
                            <a href="https://github.com/cosinekitty/astronomy">Astronomy</a
                            >：一个支持多编程语言的天文计算库
                        </li>
                        <li>
                            <a href="https://github.com/fabricjs/fabric.js">Fabric.js</a>：一个简单而强大的 JavaScript
                            HTML5 画布库。
                        </li>
                        <li><a href="https://simbad.cds.unistra.fr/simbad">SIMBAD</a>：一个天体数据库</li>
                    </ul>
                </div>
                <div class="col-logo">
                    <img src="/src/img/icon/starLocator.png" alt="StarLocator" width="140" height="152" />
                    {{ version }}
                </div>
            </div>
        </div>
    </div>
</template>
