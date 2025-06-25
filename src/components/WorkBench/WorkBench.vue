<script setup>
import { onMounted } from 'vue';
import { initializeElements, initializeCanvas, initializeEvents, initializeMap } from '@/interface/init';
import InteractPhotoUnit from './InteractPhoto.vue';
import InteractData from './InteractData.vue';

import { InteractPhoto } from '@/interface/classes/interact';

import { useButtonFunStore } from '@/store/buttonFun';

const interactPhoto = new InteractPhoto();

const buttonFunStore = useButtonFunStore();
buttonFunStore.init(interactPhoto);

onMounted(() => {
    initializeElements(interactPhoto);
    initializeCanvas(interactPhoto);
    initializeEvents(interactPhoto);
    initializeMap(interactPhoto);
});
</script>

<template>
    <div class="col-measure">
        <InteractPhotoUnit />
        <InteractData v-model:celeArray="interactPhoto.CeleArray" />
    </div>
</template>
