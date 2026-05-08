<div align="center">

# StarLocator

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL%20v3-blue.svg)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/BengbuGuards/StarLocator?style=social)](https://github.com/BengbuGuards/StarLocator/stargazers)
[![Web App](https://img.shields.io/badge/demo-live-brightgreen)](https://caveallegory.cn/StarLocator/)
[![Help](https://img.shields.io/badge/docs-user%20guide-informational)](https://bengbuguards.github.io/StarLocator/help.html)

A celestial positioning app that estimates where a night-sky photo was taken by turning the camera into a modern sextant.

[Live Demo](https://caveallegory.cn/StarLocator/) · [User Guide](https://bengbuguards.github.io/StarLocator/help.html) · [Join QQ Group](https://qm.qq.com/q/lmRhILlX0e)

</div>

## Table of Contents

- [What is StarLocator?](#what-is-starlocator)
- [Why it is useful](#why-it-is-useful)
- [Key features](#key-features)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Accuracy and privacy](#accuracy-and-privacy)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## What is StarLocator?

**中文**  
StarLocator 是一款天文定位应用。它使用星空照片和精确拍摄时间作为输入，结合经典天文导航思路，估算拍摄者在地球上的大致位置。这个过程和历史上使用六分仪测量天体高度角的做法类似，只是把测量工具换成了相机与图像算法。

**English**  
StarLocator is a celestial positioning application. It takes a night-sky photo and the exact capture time, then estimates the photographer's rough location on Earth using the same core idea as classical celestial navigation, with image processing standing in for a sextant.

> This project is about astronomy and navigation, not astrology or metaphysics.

## Why it is useful

- Explore a practical, visual version of celestial navigation
- Learn how image recognition and astronomy can work together
- Reproduce the workflow with an open source codebase
- Experiment with a privacy-friendly positioning tool for research and education

## Key features

- **Automatic star recognition** from uploaded night-sky photos
- **Fast workflow**: mark stars, mark the plumb line, set the time, then calculate
- **Frontend/backend separation** so the compute service only receives the minimum required data
- **Robust algorithms** designed to tolerate environmental noise and marking error
- **Open source transparency** under AGPL v3

## How it works

1. Upload or capture a night-sky image.
2. Mark the stars and the plumb line in the interface.
3. Confirm the exact capture time.
4. Let StarLocator match celestial data and solve for the rough location.
5. Review the computed result and error range.

## Project structure

| Path | Purpose |
|---|---|
| `src/` | Frontend source code |
| `examples/` | Sample data for testing and demos |
| `docs/` | Installation, contribution, and user documentation |
| `prototype/` | Early experiments and prototype assets |
| `pyproject.toml` | Python backend dependencies |
| `package.json` | Frontend build tooling |

## Installation

Detailed setup steps live in [docs/INSTALLATION.md](./docs/INSTALLATION.md).

### Backend

```bash
uv sync
uv run uvicorn src.backend.main:app --reload
```

### Frontend

```bash
pnpm install
pnpm run dev
```

### Production build

```bash
pnpm run build
pnpm run serve
```

## Usage

For the full walkthrough, see the [online help page](https://bengbuguards.github.io/StarLocator/help.html).

### Typical workflow

1. Open the web app.
2. Load a star photo.
3. Identify or confirm star points.
4. Draw the plumb line.
5. Enter the capture time precisely.
6. Run the calculation and inspect the result.

## Accuracy and privacy

- In the maintainers' description, error can usually stay below **30 km** under good conditions.
- The backend only handles the information needed for the positioning step and removes it after computation.
- Final accuracy depends on sky conditions, photo quality, and marking precision.

## Roadmap

Potential additions that would help new users:

- More example datasets and expected outputs
- A troubleshooting section for common recognition failures
- More screenshots for the full workflow
- Developer docs for backend/frontend local setup

## Contributing

Contributions are welcome. Start with [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md), then open an issue or pull request for improvements, bug fixes, docs, or examples.

## Credits

### Open source projects

See [NOTICE.md](./NOTICE.md).

### Developers

Listed by join time in the original project notes:

- 小流汗黄豆 | BengbuGuards
- 鬼蝉 | Hiroshi1993
- 无限远点的辩证法 | cheanus
- 着火的冰块nya | zhdbk3
- 薛定谔的按钮
- hanran
- Charmian
- Yisan5772156

## License

Released under [AGPL-3.0](./LICENSE).

[![Star History Chart](https://api.star-history.com/svg?repos=BengbuGuards/StarLocator&type=Timeline)](https://star-history.com/#BengbuGuards/StarLocator&Timeline)
