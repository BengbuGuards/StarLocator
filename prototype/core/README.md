# 后端
## 运行
1. 进入本文件夹
2. 运行
    ```bash
    uvicorn main:app --reload
    ```

## 单元测试

### 结构
- FindZ: 焦距计算
- stellarium: 生成星图以供算法测试
- TopPoint: 灭点计算

### 安装
1. 命令行进入本文件夹
2. 安装依赖
    ```bash
    pip install -r requirements.txt
    ```

### 运行
尽量写好单元测试。单元测试的运行方式是进入本文件夹，运行

```bash
pytest
```
