<script setup>
import { version } from '/package.json';
</script>

<template>
    <div style="margin-top: 30px">
        <h2>关于</h2>
        <!--TODO: 这里填README相同的注意事项-->
        <div class="row">
            <div class="col-acknow">
                感谢开源项目（完整名单见<a href="https://github.com/BengbuGuards/StarLocator/blob/main/NOTICE.md"
                    >NOTICE</a
                >）：
                <ul>
                    <li><a href="https://stellarium.org">Stellarium</a>：一款强大的开源天文馆软件</li>
                    <li>
                        <a href="https://github.com/cosinekitty/astronomy">Astronomy</a>：一个支持多编程语言的天文计算库
                    </li>
                    <li>
                        <a href="https://github.com/fabricjs/fabric.js">Fabric.js</a>：一个简单而强大的 JavaScript HTML5
                        画布库。
                    </li>
                    <li><a href="https://simbad.cds.unistra.fr/simbad">SIMBAD</a>：一个天体数据库</li>
                </ul>
            </div>
            <div class="col-logo">
                <img src="/src/img/icon/starLocator.png" alt="StarLocator" width="140" height="152" />
                {{ version }}
            </div>
        </div>
    </div>
</template>
