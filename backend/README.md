# 后端

## 安装
1. 命令行进入本文件夹
2. 安装依赖
    ```bash
    pip install -r requirements.txt
    ```

## 后端

### 运行
1. 进入本文件夹
2. 自定义config.py中的配置
3. 运行
    ```bash
    python main.py
    ```
    开发时可使用reload模式
    ```bash
    uvicorn main:app --port 6975 --reload
    ```

## 单元测试

### 结构
- core
    - Find_z: 焦距计算
    - stellarium: 生成星图以供算法测试
    - top_point: 灭点计算
- routers: FastAPI的路由
- schemas: FastAPI的数据模型
- tests: 单元测试
- main.py: FastAPI的入口
- config.py: 配置文件
- requirements.txt: 依赖

### 运行
尽量写好单元测试。单元测试的运行方式是进入本文件夹，运行

```bash
pytest tests
```

注意需先启动后端。
