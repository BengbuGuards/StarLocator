# StarLocator

[![Stars](https://img.shields.io/github/stars/BengbuGuards/StarLocator?style=flat-square)](https://github.com/BengbuGuards/StarLocator/stargazers)
[![License](https://img.shields.io/github/license/BengbuGuards/StarLocator?style=flat-square)](https://github.com/BengbuGuards/StarLocator/blob/main/LICENSE)
[![Website](https://img.shields.io/badge/web-live-2ea44f?style=flat-square)](https://caveallegory.cn/StarLocator/)

A celestial positioning app that estimates where a night-sky photo was taken by combining star recognition with the exact capture time.

一个基于传统天文导航思路的天文定位应用。StarLocator 使用星空照片与精确拍摄时间，估算拍摄者在地球上的大致位置。

## Table of Contents

- [Quick Links](#quick-links)
- [What StarLocator Does](#what-starlocator-does)
- [Highlights](#highlights)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Repository Layout](#repository-layout)
- [Contributing](#contributing)
- [Credits](#credits)

## Quick Links

- Community QQ group: <https://qm.qq.com/q/lmRhILlX0e>
- Latest web app: <https://caveallegory.cn/StarLocator/>
- Help guide: <https://bengbuguards.github.io/StarLocator/help.html>
- Installation notes: [docs/INSTALLATION.md](./docs/INSTALLATION.md)
- Contributing guide: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## What StarLocator Does

StarLocator modernizes a navigation technique that sailors have used for centuries. Instead of measuring star altitude with a sextant, it uses a photo of the night sky plus the capture time to estimate the observer's location.

StarLocator 与占星、玄学或“心灵感应”无关，它做的是天体识别、几何测量和定位计算。

## Highlights

- **Automatic star recognition** / 自动识星
- **Simple workflow** with marking tools and guided steps / 交互简单，熟练后可在几分钟内完成
- **Privacy-friendly architecture** / 前后端分离，核心计算后删除必要数据
- **Robust positioning** with good tolerance to noise / 对环境噪声和标记误差有较好鲁棒性
- **Open source and transparent** / 使用 AGPL v3，欢迎社区共建

## How It Works

1. Take or import a night-sky photo.
2. Mark stars, the plumb line, and the capture time.
3. Let StarLocator identify celestial bodies and solve the approximate location.
4. Review the result and iterate if needed.

## Installation

See the full installation guide in [docs/INSTALLATION.md](./docs/INSTALLATION.md).

For local frontend development, the main scripts are:

```bash
pnpm install
pnpm dev
pnpm build
pnpm serve
```

## Usage

- Web help and walkthrough: <https://bengbuguards.github.io/StarLocator/help.html>
- Prototype scripts and sample data: [`prototype/`](./prototype/) and [`examples/`](./examples/)

A typical flow is: open the app, upload a star photo, finish the guided markings, then run the calculation.

## Repository Layout

```text
src/          Frontend source files
examples/     Example images and CSV data
prototype/    Early Python prototype
docs/         Installation and contribution docs
```

## Contributing

Contributions are welcome. If you want to help with astronomy data, UX, frontend work, or documentation, please start with [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md).

## Credits

- Open-source notices: [NOTICE.md](./NOTICE.md)
- Developers (ordered by join time):
  - BengbuGuards
  - Hiroshi1993
  - cheanus
  - zhdbk3
  - 薛定谔的按钮
  - hanran
  - Charmian
  - Yisan5772156
