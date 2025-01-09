<script setup>
import { ref } from 'vue';
import ToolBar from './ToolBar.vue';
import MeasureShow from './MeasureShow.vue';
import SettingResult from './SettingResult.vue';
import { InteractPhoto } from '/src/interface/classes/interact.js';
import { EventManager } from '/src/interface/classes/EventManager.js';

class StarCoord {
    constructor(id, name = null, hAngle = null, declin = null, x = null, y = null) {
        this.id = id;
        this.name = name;
        this.hAngle = hAngle;
        this.declin = declin;
        this.x = x;
        this.y = y;
    }
}
const stars = ref(Array.from({ length: 5 }, (_, i) => new StarCoord(i+1)));
const results = ref({
    focLenPix: 0,
    focLenMm: 0,
    outputLong: 0,
    outputLat: 0,
});

const interactPhoto = new InteractPhoto();
// eslint-disable-next-line no-unused-vars
const eventManager = new EventManager(interactPhoto);
</script>

<template>
    <ToolBar />
    <MeasureShow :stars="stars" />
    <SettingResult :results="results" />
</template>
