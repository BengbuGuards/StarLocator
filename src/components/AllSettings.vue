<template>
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
</template>
