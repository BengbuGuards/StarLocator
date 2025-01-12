<script setup>
import ToolBar from './ToolBar.vue';
import WorkBench from './WorkBench/WorkBench.vue';
import AllSettings from './AllSettings.vue';
import ShowResults from './ShowResults.vue';
import ShowAbouts from './ShowAbouts.vue';

import { InteractPhoto } from '@/interface/classes/interact';
import { EventManager } from '@/interface/classes/EventManager';

const interactPhoto = new InteractPhoto();
// eslint-disable-next-line no-unused-vars
const eventManager = new EventManager(interactPhoto);
</script>

<template>
    <ToolBar />
    <WorkBench />
    <div class="col-result">
        <AllSettings />
        <ShowResults />
        <ShowAbouts />
    </div>
</template>
