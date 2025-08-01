# 灭点计算误差测试框架

## 算法原形

使用 python 来进行一组直线交点算法的验证。所提供的直线实际上交于一点，每条直线由两个端点坐标表示，含一定噪声，需要计算它们的真实交点。

## 排行榜

### 无畸变

**参数**：

```python
args.num_lines = 10  # 线的数量
args.num_tests = 100  # 测试次数
args.scope_x = (-300, 300)
args.scope_y = (-2000, -1000)
args.alpha = 0.2  # 0~1，越大时两点的距离越接近
args.k1 = 0  # 畸变系数
args.k2 = 0  # 畸变系数
args.noise_std = 1  # 高斯噪声标准差
```

| 排名 | 方法                                                                | 平均误差   | 95%置信区间          |
|----|-------------------------------------------------------------------|--------|------------------|
| 1  | [matrix_inverse_normalized](methods/matrix_inverse_normalized.py) | 3.953  | (3.831, 4.076)   |
| 2  | [matrix_inverse](methods/matrix_inverse.py)                       | 8.022  | (7.807, 8.237)   |
| 3  | [sphere](methods/sphere.py)                                       | 8.025  | (7.810, 8.240)   |
| 4  | [median2](methods/median2.py)                                     | 9.375  | (9.114, 9.635)   |
| 5  | [median](methods/median.py)                                       | 9.548  | (9.283, 9.812)   |
| 6  | [least_square](methods/least_square.py)                           | 11.964 | (11.057, 12.872) |

### 有畸变

**参数**：

```python
args.num_lines = 10  # 线的数量
args.num_tests = 3000  # 测试次数
args.scope_x = (-300, 300)
args.scope_y = (-2000, -1000)
args.alpha = 0.2  # 0~1，越大时两点的距离越接近
args.k1 = 1e-7  # 畸变系数
args.k2 = 1e-14  # 畸变系数
args.noise_std = 1  # 高斯噪声标准差
```

| 排名 | 方法                                                                | 平均误差   | 95%置信区间          |
|----|-------------------------------------------------------------------|--------|------------------|
| 1  | [matrix_inverse_normalized](methods/matrix_inverse_normalized.py) | 10.628 | (10.226, 11.030) |
| 2  | [matrix_inverse](methods/matrix_inverse.py)                       | 37.666 | (37.043, 38.289) |
| 3  | [sphere](methods/sphere.py)                                       | 37.699 | (37.076, 38.323) |
| 4  | [median2](methods/median2.py)                                     | 47.518 | (46.607, 48.430) |
| 5  | [median](methods/median.py)                                       | 50.080 | (49.129, 51.031) |
| 6  | [least_square](methods/least_square.py)                           | 62.304 | (61.098, 63.511) |

## 使用方法

1. 在`core`目录下运行

```bash
python -m positioning.top_point.benchmark
```

## 贡献方法

1. 在 `methods` 目录下新建一个文件，实现一个算法。  
   需实现一个函数`intersection`，接受一个`numpy.ndarray`的`shape=(n, 2, 2)`的直线两点数组，返回一个`numpy.ndarray`的`shape=(2,)`的交点坐标数组。
2. 在 `benchmark.py` 的`methods`列表中添加你的方法。
3. 运行 `python benchmark.py` 来测试你的方法。
