# 安装
1. 克隆仓库，安装Node.js、pnpm和Python（版本尽量较新）。
2. 前端构建

    自定义前端配置文件[config.js](../src/config.js)。Astrometry.net API key申请见[Astrometry.net](https://nova.astrometry.net/api_help)。

    安装依赖：
    ```bash
    pnpm install
    ```

    构建前端：
    ```bash
    pnpm build
    ```

    运行前端：
    ```bash
    pnpm serve
    ```

    前端已在`http://localhost:6974`运行。

    （Optional）如果你想在开发模式下运行项目，可以使用
    ```bash
    pnpm dev
    ```

3. 后端构建

    进入`backend`目录：
    ```bash
    cd backend
    ```

    自定义后端配置文件[config.py](../backend/config.py)。

    安装依赖：
    ```bash
    uv sync --no-dev
    ```

    （Optional）安装开发依赖：
    ```bash
    uv sync --dev
    ```

    运行后端：
    ```bash
    python main.py
    ```

    后端已在`http://localhost:6975`运行。
