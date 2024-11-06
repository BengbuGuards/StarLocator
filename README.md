# StarLocator

💬<a href="https://qm.qq.com/q/lmRhILlX0e">加入StarLocator交流群</a> | 🌎<a href="https://caveallegory.cn/StarLocator/">在线版镜像链接</a>

> StarLocator 是什么 | WHAT IS STARLOCATOR

StarLocator是一款天文定位应用，主要基于一种已经应用了数个世纪的航海导航技术。该应用使用夜空照片及其精确拍摄时间为源数据，计算照片拍摄地在地球上的大致位置。该过程类似以相机对图中的天体高度角进行测量代替17世纪以来的水手使用六分仪的测量，与占星术、玄学和心灵感应无关。

StarLocator is a celestial positioning application mainly based on a maritime navigation technique that has been applied
for centuries. In this app, a photo of night sky and the exact time when it was taken were used as source information to
calculate the rough position of the photo taker was on the earth. The process is quite like using the camera as a
sextant to measure the elevation of celestial bodies in the image just as sailors did since 17th century, and there is
NOTHING to do with astrology, metaphysics and telepathy.

## 特点 | FEATURES

- 😀**交互简单**：标星、标铅垂线、设置拍摄时间，然后就是点击按钮的事了，熟练掌握后整个过程不到**5分钟**。原本的耗时步骤，如查询天体天文数据，已被API和按钮所实现。
- 🔒**隐私友好**：项目仅用前端技术实现，核心步骤均在本地运行，可自行部署。
- 🎯**精度良好**：我们在各个模块中采用了强稳健性的算法，对环境噪声、标记误差有良好的抗噪能力，误差通常可稳定在**30km**以下。
- ✅**完全开源**：我们使用AGPL v3开源，目的是为尽可能地使该方法透明，同时欢迎社区共建。
- 😀**Simple interaction**: Marking stars and plumblines, setting the time and then simply click a button. Can finish within **5 minutes** when familiar. All time-consuming steps, like searching for data of celestial bodies, have been achieved with API and buttons.
- 🔒**Privacy friendly**: Front-end based and self-deployable, all key steps running locally.
- 🎯**Good accuracy**: We applied robust algorithms in modules, making it resilient to environmental noises and marking errors. The error can usually be limited to **30km**.
- ✅**Fully open sourced**: AGPL v3 open source protocol adopted. Aiming to make the approach as transparent as possible and to welcome community contributions.

## 使用方法 | HOW TO USE

*注：详细帮助请点击网页的问号按钮。*

1. 🌃点击“选择文件”导入图片。图片需要满足以下条件：
    - 是一张真实的夜空图片；
    - 尽可能清晰。拖影、失焦或变形都可能会严重影响定位结果，但广角理论上不影响；
    - 需要包括恒星和行星在内的至少3个天体。太阳和月亮不可以，因为它们不清真（bushi）。*在最初版本中，您需要自行识别天体，但别担心，我们正在制作自动天体识别功能，并计划在宇宙达到热寂之前更新。
    - 需要多条铅垂线用于天顶计算。铅垂线越多或者地平线越完整，定位结果将会越准确。
    - 需要知道该照片拍摄的准确时间（年月日时分，若知道秒数则更好）。
2. 🌟点击那个看起来像手里剑的按钮开始选星（需3颗）。选取的星星最好是水平分布的，或者如果您熟悉这个概念的话，最好不要让它们与天顶的连线之间形成过小的夹角。*您可以在表格中修改星星的图中坐标，并同步让图中的标记移动。
3. 🕛在底部的表格中输入正确的时间和标准的星名后，点击“获取天体坐标”按钮获取天体的赤纬和参考时角。*可以点击标记左上角的“×”来删除标记。
4. ↕️点击那个看起来像翘屁末影人的按钮开始绘制铅垂线。越多越好。
5. 🧮**猛猛拍打**“计算”按钮然后就能在右侧的结果栏中看到结果了。

<br>

1. 🌃Click “选择文件”, import your image. The image should follow these requirements:
    - It is a real image of night sky;
    - As clear as possible. Smear, defocus, and distortions could severely impact the positioning result, but wide-angle
      theoretically doesn't affect;
    - At least 3 celestial bodies including stars and planets. The sun and the moon are not acceptable since both of
      them are haram (joking). * In the initial release you need to recognize the stars by yourself but don't worry, we
      are working on the automatic star recognizing function. We will install it before the universe reaching the heat
      death.
    - Multiple plumb lines are necessary for zenith calculation. The more plumb lines or the longer horizon, the more
      precise the result will be.
    - You know the exact time (year, date, hour, minute, and better with second) when the photo was taken.
2. 🌟Click the shining shuriken icon to start to pick stars (totally 3 stars are needed). The picked stars are better
   distributed horizontally, or if you know what exactly I'm talking, don't form too small an angle relative to the
   zenith. * You can revise the coordination data of stars in the table below, and the marker on the picture will move
   accordingly.
3. 🕛Enter exact time and standard name of celestial bodies in the bottom table, and click the clock button to acquire
   reference hour angles and declinations. * You can click the “x” on the top-left of a marker to delete it.
4. ↕️Click the long limb alien(Enderman or sth) icon to draw lines along plumb lines on the image. More is better.
5. 🧮**SMASH** the “Calculate” button and you'll see the result in result column on the right.

## 贡献 | CONTRIBUTING

见[CONTRIBUTING.md](./CONTRIBUTING.md)

## 构建 | BUILD

1. 安装Node.js和pnpm。
2. 在项目根目录下安装依赖
```bash
pnpm install
```
3. 构建项目
```bash
pnpm build
```
4. 运行项目
```bash
pnpm serve
```
现在你可以在浏览器中访问`http://localhost:6974`查看项目。

（Optional）如果你想在开发模式下运行项目，可以使用
```bash
pnpm dev
```

## 致谢 | CREDITS

### 开源项目 | OPEN SOURCE PROJECTS

见[NOTICE.md](./NOTICE.md)

### 开发团队 | DEVELOPERS

按加入时间排序

- 小流汗黄豆 | BengbuGuards
- 鬼蝉 | Hiroshi1993
- 无限远点的辩证法 | cheanus
- MC着火的冰块 | zhdbk3
- 薛定谔的按钮
- hanran
- Charmian
- Yisan5772156
