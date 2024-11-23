# 焦距计算误差测试框架

## 算法原形

使用 python 来测试焦距计算算法的误差

## 排行榜
**参数**：
```python
args.num_points = 5  # 点的数量
args.num_tests = 100  # 测试次数
args.scope_x = (-1000, 1000)
args.scope_y = (1000, 2000)
args.z = 3000  # 焦距
args.noise_std = 1  # 高斯噪声标准差
```

|排名|方法|平均误差|95%置信区间|
|---|---|---|---|
| 1 | [bi_mean](methods/bi_mean.py) | -108.287 | (-151.980, -64.594) |


## 使用方法

2. 运行
```bash
python benchmark.py
```