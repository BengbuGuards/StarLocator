<template>
    <div class="col-toolbar">
        <h2>工具</h2>
        <button type="button" class="resetButton" id="resetPick" title="重置标注">
            <img
                src="/src/img/icon/resetPick.png"
                alt="重置标注"
                width="48"
                height="48"
                style="margin-left: -4px; margin-top: -3px"
            />
        </button>
        <button type="button" class="actionButton" id="celePick" title="天体选择">
            <img
                src="/src/img/icon/celePick.png"
                alt="天体选择"
                width="48"
                height="48"
                style="margin-left: -4px; margin-top: -3px"
            />
        </button>
        <button type="button" class="actionButton" id="selectStars" title="天体框选">
            <img
                src="/src/img/icon/selectStars.png"
                alt="天体框选"
                width="48"
                height="48"
                style="margin-left: -4px; margin-top: -3px"
            />
        </button>
        <button type="button" class="actionButton" id="recognizeStars" title="天体识别">
            <img
                src="/src/img/icon/starRecognize.png"
                alt="天体识别"
                width="48"
                height="48"
                style="margin-left: -4px; margin-top: -3px"
            />
        </button>
        <button type="button" class="actionButton" id="vaniZen" title="铅垂线标记">
            <img
                src="/src/img/icon/vaniZen.png"
                alt="铅垂线标记"
                width="48"
                height="48"
                style="margin-left: -4px; margin-top: -3px"
            />
        </button>
        <!-- <button type="button" class="actionButton" id="horiZen" title="地平线标记">
            <img src="/src/img/icon/horiZen.png" alt="地平线标记" width="48" height="48"
                 style="margin-left:-4px; margin-top:-3px">
            </button> -->
        <button type="button" class="actionButton" id="moonTime" title="标月定时">
            <img
                src="/src/img/icon/moonTime.png"
                alt="标月定时"
                width="48"
                height="48"
                style="margin-left: -4px; margin-top: -3px"
            />
        </button>
        <a href="https://stellarium-web.org/" target="_blank" style="text-decoration: none" rel="noopener">
            <button type="button" class="helpButton" id="stellariumWeb" title="Stellarium在线星图">
                <img
                    src="/src/img/icon/stellariumweb.svg"
                    alt="Stellarium"
                    width="46"
                    height="46"
                    style="margin-left: -4px; margin-top: -3px; margin-bottom: 2px"
                />
            </button>
        </a>
        <a href="/src/help.html" target="_blank">
            <button type="button" class="helpButton" id="howToUse" title="怎么用啊">
                <img
                    src="/src/img/icon/emojiThinking.png"
                    alt="怎么用啊"
                    width="48"
                    height="48"
                    style="margin-left: -4px; margin-top: -3px"
                />
            </button>
        </a>
    </div>
</template>
