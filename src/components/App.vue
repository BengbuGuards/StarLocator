<script setup>
import ToolBar from './ToolBar.vue';
import WorkBench from './WorkBench/WorkBench.vue';
import AllSettings from './AllSettings.vue';
import ShowResults from './ShowResults.vue';
import ShowAbouts from './ShowAbouts.vue';
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
