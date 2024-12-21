# 灭点计算误差测试框架

## 算法原形

使用 python 来进行一组直线交点算法的验证。所提供的直线实际上交于一点，每条直线由两个端点坐标表示，含一定噪声，需要计算它们的真实交点。

## 排行榜
### 无畸变
**参数**：
```python
args.num_lines = 10    # 线的数量
args.num_tests = 100     # 测试次数
args.scope_x = (-300, 300)
args.scope_y = (-2000, -1000)
args.alpha = 0.2  # 0~1，越大时两点的距离越接近
args.k1 = 0  # 畸变系数
args.k2 = 0  # 畸变系数
args.noise_std = 1  # 高斯噪声标准差
```

|排名|方法|平均误差|95%置信区间|
|---|---|---|---|
| 1 | [matrix_inverse](methods/matrix_inverse.py) | 7.684 | (6.496, 8.872) |
| 2 | [sphere](methods/sphere.py) | 7.687 | (6.498, 8.875) |
| 3 | [median2](methods/median2.py) | 8.987 | (7.709, 10.266) |
| 4 | [median](methods/median.py) | 9.203 | (7.899, 10.506) |
| 5 | [nearest_l2](methods/nearest_l2.py) | 11.375 | (8.062, 14.688) |
| 6 | [least_square](methods/least_square.py) | 11.570 | (8.128, 15.013) |
| 7 | [square_weight](methods/square_weight.py) | 45.755 | (31.688, 59.822) |

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

|排名|方法|平均误差|95%置信区间|
|---|---|---|---|
| 1 | [matrix_inverse](methods/matrix_inverse.py) | 37.326 | (36.728, 37.923) |
| 2 | [sphere](methods/sphere.py) | 37.359 | (36.761, 37.957) |
| 3 | [median2](methods/median2.py) | 47.079 | (46.180, 47.977) |
| 4 | [median](methods/median.py) | 49.681 | (48.733, 50.629) |
| 5 | [least_square](methods/least_square.py) | 61.402 | (60.303, 62.501) |

## 使用方法

2. 运行
```bash
python benchmark.py
```

## 贡献方法
1. 在 `methods` 目录下新建一个文件，实现一个算法。  
    需实现一个函数`intersection`，接受一个`numpy.ndarray`的`shape=(n, 2, 2)`的直线两点数组，返回一个`numpy.ndarray`的`shape=(2,)`的交点坐标数组。
2. 在 `benchmark.py` 的`methods`列表中添加你的方法。
3. 运行 `python benchmark.py` 来测试你的方法。
