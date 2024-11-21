## 算法原形

使用 python 来进行算法的验证

### 排行榜
**参数**：
```python
args.num_lines = 10    # 线的数量
args.num_tests = 100     # 测试次数
args.scope_x = (-300, 300)
args.scope_y = (-2000, -1000)
args.alpha = 0.2  # 0~1，越大时两点的距离越接近
args.noise_std = 1  # 高斯噪声标准差
```

|排名|方法|平均误差|95%置信区间|
|---|---|---|---|
|1|[剔除后中位法](methods/median2.py)|8.577|[7.326, 9.828]|
|2|[中位数法](methods/median.py)|9.559|[8.130, 10.987]|
|3|[L2最近点法](methods/nearest_l2.py)|10.598|[8.938, 12.259]|
|4|[最小二乘法](methods/least2.py)|11.619|[9.501, 13.738]|
|5|[二次倒加权法](methods/square_weight.py)|14.380|[12.286, 16.475]|


### 使用方法

1. 命令行进入本文件夹
1. 安装依赖
    ```bash
    pip install -r requirements.txt
    ```
2. 运行
    ```bash
    python benchmark.py
    ```


### 单元测试

尽量写好单元测试。单元测试的运行方式是进入本文件夹，运行

```bash
pytest
```
