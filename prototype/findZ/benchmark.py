import argparse

import numpy as np
import scipy.stats as st

from methods.bi_mean import get_z as bi_mean
from methods.trisect import get_z as trisect
from methods.north_len import get_z as north_len
from utils.rand import rand_range
from utils.math import vector_angle


def generate_points(args):
    num_points = args.num_points
    scope_x = args.scope_x
    scope_y = args.scope_y
    ## 生成点和夹角（弧度）
    points = []
    thetas = np.zeros((num_points, num_points), dtype=np.float32)
    for i in range(num_points):
        ## 生成一个参考点
        points_x = rand_range(*scope_x)
        points_y = rand_range(*scope_y)
        points.append([points_x, points_y])
    points = np.array(points)

    ## 计算夹角
    for i in range(num_points):
        for j in range(i + 1, num_points):
            vec_a = np.concatenate([points[i], [args.z]])
            vec_b = np.concatenate([points[j], [args.z]])
            cos_theta = np.dot(vec_a, vec_b) / (
                np.linalg.norm(vec_a) * np.linalg.norm(vec_b)
            )
            thetas[i, j] = thetas[j, i] = np.arccos(cos_theta)

    # 根据一个随机的北天极，生成赤纬
    ## 生成一个随机的北天极
    north_pole = np.random.rand(3)
    ## 生成赤纬
    des = np.array(
        [
            np.pi / 2 - vector_angle(north_pole, np.concatenate([point, [args.z]]))
            for point in points
        ]
    )

    ## 施加径向畸变
    if args.k1 is not None and args.k2 is not None:
        points = destort(points, args.k1, args.k2, args.scope_x, args.scope_y)
    ## 加入高斯噪声
    points += np.random.normal(0, args.noise_std, points.shape)

    return {
        "points": points,
        "thetas": thetas,
        "des": des,
    }


def destort(points, k1, k2, scope_x, scope_y):
    """
    施加径向畸变
    params:
        points: np.array, shape=(n, 2), 2D points
        k1: float, radial distortion coefficient
        k2: float, tangential distortion coefficient
        scope_x: tuple, x scope
        scope_y: tuple, y scope
    return:
        points: np.array, shape=(n, 2), 2D points
    """
    center = np.array([scope_x[0] + scope_x[1], scope_y[0] + scope_y[1]]) / 2
    points_relative = points - center
    r = np.hypot(points_relative[:, 0], points_relative[:, 1]).reshape(-1, 1)
    points_relative *= 1 + k1 * r**2 + k2 * r**4
    points = points_relative + center
    return points


def print_results(results):
    ## 输出结果
    for name, result in results.items():
        print("Method:", name)
        error = np.array(result["error"])
        # print('Mean error:', np.mean(error), 'Std:', np.std(error, ddof=1))
        print(
            "\tMean error:",
            np.mean(error),
            "Interval:",
            st.t.interval(
                0.95, len(error) - 1, loc=np.mean(error), scale=st.sem(error)
            ),
        )
    ## 输出markdown表格
    print("|排名|方法|平均误差|95%置信区间|")
    print("|---|---|---|---|")
    results = dict(
        sorted(results.items(), key=lambda x: np.mean(x[1]["error"]), reverse=False)
    )  # 误差从小到大
    for i, (name, result) in enumerate(results.items()):
        error = np.array(result["error"])
        mean_error = np.mean(error)
        interval = st.t.interval(
            0.95, len(error) - 1, loc=mean_error, scale=st.sem(error)
        )
        print(
            "|",
            i + 1,
            "|",
            f"[{name}](methods/{name}.py)",
            "|",
            f"{mean_error:.3f}",
            "|",
            f"({interval[0]:.3f}, {interval[1]:.3f})",
            "|",
        )


def main(methods, args):
    results = {}
    for name in methods.keys():
        results[name] = {"error": []}
    for _ in range(args.num_tests):
        ## 生成点和夹角
        datas = generate_points(args)
        for name, method in methods.items():
            ## 计算焦距
            z = method(datas)
            ## 计算误差
            results[name]["error"].append(np.abs(z - args.z))
    ## 排序
    results = dict(
        sorted(results.items(), key=lambda x: np.mean(x[1]["error"]), reverse=True)
    )
    ## 输出结果
    print_results(results)


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.num_points = 5  # 点的数量
    args.num_tests = 100  # 测试次数
    args.scope_x = (-1000, 1000)
    args.scope_y = (1000, 2000)
    args.z = 3000  # 焦距
    args.k1 = 1e-9  # 畸变系数k1
    args.k2 = 1e-18  # 畸变系数k2
    args.noise_std = 1  # 高斯噪声标准差

    ## 检测是否有效范围
    assert args.scope_x[0] < args.scope_x[1]
    assert args.scope_y[0] < args.scope_y[1]

    ## 定义所需评测的方法
    methods = {
        "bi_mean": bi_mean,
        "trisect": trisect,
        "north_len": north_len,
    }

    main(methods, args)
