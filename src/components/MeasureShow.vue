<script setup>
defineProps({
    stars: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <div class="col-measure">
        <h2>测量</h2>
        <input type="file" id="srcFile" accept="image/*" aria-label="上传文件" />
        <button type="button" id="resetZoom" style="float: right">重置缩放</button>
        <div id="box" style="min-width: 450px; height: 600px; width: 100%">
            <canvas id="canvas"></canvas>
        </div>
        <div style="margin-bottom: 30px">
            <div id="picInfo" style="float: left"></div>
            <div id="canvasStatus" style="float: left"></div>
            <div id="cursorCrd" style="float: right"></div>
        </div>
        <div style="margin-top: 15px">
            <div class="row">
                <div class="col-input">
                    <table class="inputTable" id="inputTable">
                        <thead>
                            <tr>
                                <th style="width: 8%" class="tooltip">
                                    序号<span class="tooltiptext">天体的序号</span>
                                </th>
                                <th style="width: 20%" class="tooltip">
                                    天体名称<span class="tooltiptext"
                                        >天体的名称，中英文皆可；中文在星座名和希腊字母之间需要加上空格</span
                                    >
                                </th>
                                <th style="width: 25%" class="tooltip">
                                    参考时角<span class="tooltiptext"
                                        >在0°经线读取的天体时角，可以用于计算GP点经度</span
                                    >
                                </th>
                                <th style="width: 20%" class="tooltip">
                                    赤纬<span class="tooltiptext">天体的赤纬，即GP点的纬度</span>
                                </th>
                                <th style="width: 12%" class="tooltip">
                                    x<span class="tooltiptext">天体在照片中的横坐标</span>
                                </th>
                                <th style="width: 12%" class="tooltip">
                                    y<span class="tooltiptext">天体在照片中的纵坐标</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="zenith">0</td>
                                <td class="zenith">天顶</td>
                                <td class="zenith">N/A</td>
                                <td class="zenith">N/A</td>
                                <td>
                                    <input
                                        type="number"
                                        class="coordsInput zenith table"
                                        id="zenX"
                                        aria-label="天顶x"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="coordsInput zenith table"
                                        id="zenY"
                                        aria-label="天顶y"
                                    />
                                </td>
                            </tr>
                            <tr v-for="star in stars" :key="star.id">
                                <td>{{ star.id }}</td>
                                <td>
                                    <input
                                        type="text"
                                        autocomplete="new-password"
                                        style="flex: 1"
                                        :id="'name' + star.id"
                                        aria-label="name"
                                    />
                                </td>
                                <td>
                                    <div class="formatedInput">
                                        <div contenteditable="true" :id="'hAngleH' + star.id"></div>
                                        h
                                        <div contenteditable="true" :id="'hAngleM' + star.id"></div>
                                        m
                                        <div contenteditable="true" :id="'hAngleS' + star.id"></div>
                                        s
                                    </div>
                                </td>
                                <td>
                                    <div class="formatedInput">
                                        <div contenteditable="true" :id="'declinD' + star.id"></div>
                                        °
                                        <div contenteditable="true" :id="'declinM' + star.id"></div>
                                        ′
                                        <div contenteditable="true" :id="'declinS' + star.id"></div>
                                        ″
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="coordsInput table"
                                        :id="'coordX' + star.id"
                                        aria-label="x"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="coordsInput table"
                                        :id="'coordY' + star.id"
                                        aria-label="y"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-calcul">
                    <button type="button" class="calculButton" id="actionCalcul" title="计算">
                        <img
                            src="/src/img/icon/calcu1.png"
                            alt="计算"
                            width="48"
                            height="96"
                            style="margin-left: -4px; margin-top: -3px"
                            class="calculIcon"
                        />
                        <img
                            src="/src/img/icon/calcu2.gif"
                            alt="计算"
                            width="48"
                            height="96"
                            style="margin-left: -48px; margin-top: -3px"
                            class="calculAnim"
                        />
                    </button>
                    <br />
                </div>
            </div>
        </div>
    </div>
</template>
