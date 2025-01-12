<script setup>
import { ref } from 'vue';
import InteractPhoto from './InteractPhoto.vue';
import InteractData from './InteractData.vue';

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
const stars = ref(Array.from({ length: 5 }, (_, i) => new StarCoord(i + 1)));
</script>

<template>
    <div class="col-measure">
        <InteractPhoto />
        <InteractData :stars="stars" />
    </div>
</template>
