# 焦距计算误差测试框架

## 算法原形

使用 python 来测试焦距计算算法的误差。提供Oxy平面点坐标，以及他们两两关于z轴某一焦点的夹角矩阵。每个点由两个坐标表示，含一定噪声，夹角矩阵不含噪声。需要计算真实的焦距。

## 排行榜
### 无畸变
**参数**：
```python
args.num_points = 5  # 点的数量
args.num_tests = 100  # 测试次数
args.scope_x = (-1000, 1000)
args.scope_y = (-2000, -1000)
args.z = 3000  # 焦距
args.k1 = 0  # 畸变系数k1
args.k2 = 0  # 畸变系数k2
args.noise_std = 1  # 高斯噪声标准差
```

|排名|方法|平均误差|95%置信区间|
|---|---|---|---|
| 1 | [trisect](methods/trisect.py) | 2.132 | (1.791, 2.473) |
| 2 | [bi_mean](methods/bi_mean.py) | 90.111 | (49.588, 130.633) |
| 3 | [north_len](methods/north_len.py) | 110.185 | (29.654, 190.716) |

### 有畸变
**参数**：
```python
args.num_points = 5  # 点的数量
args.num_tests = 100  # 测试次数
args.scope_x = (-1000, 1000)
args.scope_y = (-2000, -1000)
args.z = 3000  # 焦距
args.k1 = 1e-9  # 畸变系数k1
args.k2 = 1e-18  # 畸变系数k2
args.noise_std = 1  # 高斯噪声标准差
```

|排名|方法|平均误差|95%置信区间|
|---|---|---|---|
| 1 | [trisect](methods/trisect.py) | 3.048 | (2.555, 3.541) |
| 2 | [north_len](methods/north_len.py) | 107.276 | (38.042, 176.509) |
| 3 | [bi_mean](methods/bi_mean.py) | 121.416 | (76.569, 166.262) |

## 使用方法
1. 运行
```bash
python benchmark.py
```

## 贡献方法
1. 在 `methods` 目录下新建一个文件，实现一个算法。  
    需实现一个函数`getZ`，接受一个字典`datas`，其中包含：points为一个(n, 2)的数组，表示点的坐标；thetas为一个(n, n)的数组，表示夹角矩阵；des为一个(n,)的数组，表示各点的赤纬。该函数需返回一个浮点数，表示焦距。
2. 在 `benchmark.py` 的`methods`列表中添加你的方法。
3. 运行 `python benchmark.py` 来测试你的方法。
