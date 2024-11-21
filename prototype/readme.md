## 算法原形

使用 python 来进行一组直线交点算法的验证

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
| 1 | [matrix_inverse](methods/matrix_inverse.py) | 7.684 | (6.496, 8.872) |
| 2 | [sphere](methods/sphere.py) | 7.687 | (6.498, 8.875) |
| 3 | [median2](methods/median2.py) | 8.987 | (7.709, 10.266) |
| 4 | [median](methods/median.py) | 9.203 | (7.899, 10.506) |
| 5 | [nearest_l2](methods/nearest_l2.py) | 11.375 | (8.062, 14.688) |
| 6 | [least_square](methods/least_square.py) | 11.570 | (8.128, 15.013) |
| 7 | [square_weight](methods/square_weight.py) | 45.755 | (31.688, 59.822) |


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
