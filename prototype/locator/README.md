# 焦距计算误差测试框架

## 算法原形

使用 python 来测试地理定位算法的误差。提供相机坐标系下的焦距、各星矢量、灭点矢量、各星参考时角&赤纬。各星矢量、灭点矢量含一定噪声，焦距、各星参考时角&赤纬不含噪声。需要计算真实的地理坐标。

## 排行榜
### 无畸变
**参数**：
```python
args.num_points = 5  # 点的数量
args.num_tests = 100  # 测试次数
args.scope_x = (-1000, 1000)
args.scope_y = (1000, 2000)
args.z = 3000  # 焦距
args.k1 = 0  # 畸变系数k1
args.k2 = 0  # 畸变系数k2
args.noise_std = 1  # 高斯噪声标准差
```

### 有畸变
**参数**：
```python
args.num_points = 5  # 点的数量
args.num_tests = 100  # 测试次数
args.scope_x = (-1000, 1000)
args.scope_y = (1000, 2000)
args.z = 3000  # 焦距
args.k1 = 1e-9  # 畸变系数k1
args.k2 = 1e-18  # 畸变系数k2
args.noise_std = 1  # 高斯噪声标准差
```

## 使用方法
1. 运行
```bash
python benchmark.py
```

## 贡献方法
1. 在 `methods` 目录下新建一个文件，实现一个算法。  
    需实现一个函数`getZ`，接受一个字典`datas`，其中包含：points为一个(n, 3)的数组，表示各星矢量；top_point为一个(3，)的数组，表示灭点矢量；hour_des为一个(n, 2)的数组，表示各点的参考时角&赤纬；f是一个浮点数，表示焦距。所有矢量皆已归一化。该函数需返回一个(2,)，分别表示地理坐标的经度($[-\pi,\pi]$)、纬度（$[-\frac{\pi}{2},\frac{\pi}{2}]$）。
2. 在 `benchmark.py` 的`methods`列表中添加你的方法。
3. 运行 `python benchmark.py` 来测试你的方法。
