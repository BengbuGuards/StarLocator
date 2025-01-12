<template>
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
</template>
