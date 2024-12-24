# 安装
1. 克隆仓库，安装Node.js、pnpm和Python（版本尽量较新）。
2. 前端构建

    自定义前端配置文件[config.ts](../src/config.js)。

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

    进入`prototype`目录：
    ```bash
    cd prototype
    ```

    自定义后端配置文件[config.py](../prototype/config.py)。

    新建虚拟环境：
    ```bash
    conda create -n starlocator
    conda activate starlocator
    ```

    安装依赖：
    ```bash
    pip install -r requirements.txt
    ```

    运行后端：
    ```bash
    python main.py
    ```

    后端已在`http://localhost:6975`运行。
