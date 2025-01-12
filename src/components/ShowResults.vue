<script setup>
import { ref } from 'vue';

const results = ref({
    focLenPix: 0,
    focLenMm: 0,
    outputLong: 0,
    outputLat: 0,
});
</script>

<template>
    <div style="margin-top: 65px">
        <h2>结果</h2>
        <table style="width: 100%; margin-top: 10px; margin-bottom: 10px">
            <thead>
                <tr>
                    <th class="tooltip">像素焦距z<span class="tooltiptext">焦平面到光心的像素距离</span></th>
                    <th class="tooltip">35mm焦距<span class="tooltiptext">根据照片的分辨率换算得到的等效焦距</span></th>
                    <th class="tooltip">经度<span class="tooltiptext">定位点的经度；正值为东经，负值为西经</span></th>
                    <th class="tooltip">纬度<span class="tooltiptext">定位点的纬度；正值为北纬，负值为南纬</span></th>
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
</template>
