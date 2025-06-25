<script setup>
import { computed } from 'vue';
import { hourAngleFormat, declinFormat, hourAngleUnformat, declinUnformat } from '@/interface/utils.js';

const celeArray = defineModel('celeArray', {
    required: true,
    type: Array,
});

const formatStar = (star) => {
    let hAngleH, hAngleM, hAngleS, declinD, declinM, declinS;
    [hAngleH, hAngleM, hAngleS] = hourAngleFormat(star.hAngle);
    [declinD, declinM, declinS] = declinFormat(star.declin);
    return {
        ...star,
        hAngleH,
        hAngleM,
        hAngleS,
        declinD,
        declinM,
        declinS,
    };
};

const celeArrayFormated = computed(() => celeArray.value.array.map(formatStar));

const updateStar = (index, field, value) => {
    const star = celeArray.value[index];
    if (field.startsWith('hAngle')) {
        const hAngleFields = ['hAngleH', 'hAngleM', 'hAngleS'];
        star.hAngle = hourAngleUnformat(hAngleFields.map(f => celeArrayFormated[f]));
    } else if (field.startsWith('declin')) {
        const declinFields = ['declinD', 'declinM', 'declinS'];
        star.declin = declinUnformat(declinFields.map(f => celeArrayFormated[f]));
    }
    star[field] = value;
};
</script>

<template>
    <div class="col-measure">
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
                            <tr v-for="(star, index) in celeArrayFormated" :key="star.id">
                                <td>{{ star.id }}</td>
                                <td>
                                    <input
                                        type="text"
                                        autocomplete="new-password"
                                        style="flex: 1"
                                        :id="'name' + star.id"
                                        aria-label="name"
                                        v-model="celeArray[index].name"
                                    />
                                </td>
                                <td>
                                    <div class="formatedInput">
                                        <div contenteditable="true" :id="'hAngleH' + star.id" @input="updateStar(index, 'hAngleH', $event.target.innerText)">{{ star.hAngleH }}</div>
                                        h
                                        <div contenteditable="true" :id="'hAngleM' + star.id" @input="updateStar(index, 'hAngleM', $event.target.innerText)">{{ star.hAngleM }}</div>
                                        m
                                        <div contenteditable="true" :id="'hAngleS' + star.id" @input="updateStar(index, 'hAngleS', $event.target.innerText)">{{ star.hAngleS }}</div>
                                        s
                                    </div>
                                </td>
                                <td>
                                    <div class="formatedInput">
                                        <div contenteditable="true" :id="'declinD' + star.id" @input="updateStar(index, 'declinD', $event.target.innerText)">{{ star.declinD }}</div>
                                        °
                                        <div contenteditable="true" :id="'declinM' + star.id" @input="updateStar(index, 'declinM', $event.target.innerText)">{{ star.declinM }}</div>
                                        ′
                                        <div contenteditable="true" :id="'declinS' + star.id" @input="updateStar(index, 'declinS', $event.target.innerText)">{{ star.declinS }}</div>
                                        ″
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="coordsInput table"
                                        :id="'coordX' + star.id"
                                        aria-label="x"
                                        v-model="celeArray[index].x"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="coordsInput table"
                                        :id="'coordY' + star.id"
                                        aria-label="y"
                                        v-model="celeArray[index].y"
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
