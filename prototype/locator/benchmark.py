import argparse

import numpy as np
import scipy.stats as st
from copy import deepcopy
from methods.matrix_inverse import get_geo as matrix_inverse
from methods.bi_median import get_geo as bi_median
from utils.math import cart2sph, sph_dist
from utils.rand import rand_range


def generate_datas(args):
    num_points = args.num_points
    scope_x = args.scope_x
    scope_y = args.scope_y
    ## 生成星点矢量
    points = []
    for i in range(num_points):
        ## 生成一个参考点
        points_x = rand_range(*scope_x)
        points_y = rand_range(*scope_y)
        points.append([points_x, points_y, -args.z])
    points = np.array(points)

    ## 根据一个随机的北天极、一个随机的(0N,0E)轴，生成参考时角&赤纬
    ## 生成一个随机的北天极
    z_pole = rand_range(-1, 1, 3)
    z_pole /= np.linalg.norm(z_pole)
    ## 生成一个随机的(0N,0E)轴，与北天极正交
    x_pole = rand_range(-1, 1, 3)
    x_pole = x_pole - np.dot(x_pole, z_pole) * z_pole
    x_pole /= np.linalg.norm(x_pole)
    ## 生成一个随机的(0N,90E)轴，与北天极正交
    y_pole = np.cross(z_pole, x_pole)

    ## 生成随机灭点矢量
    top_point = rand_range(-1, 1, 3)
    top_point = top_point * -args.z / top_point[2]

    ## 生成参考时角&赤纬，以及真实地理坐标
    A = np.array([x_pole, y_pole, z_pole]).T
    b = np.concatenate([top_point[:, None], points.T], axis=1)
    x = np.linalg.solve(A, b).T
    geo_cart = x[0]
    points_cart = x[1:]
    geo = np.array(cart2sph(*geo_cart)[:2])
    hour_des = np.array([cart2sph(*point)[:2] for point in points_cart])

    ## 施加径向畸变
    if args.k1 is not None and args.k2 is not None:
        points = destort(points, args.k1, args.k2, args.scope_x, args.scope_y)
        top_point = destort(
            top_point.reshape(1, -1), args.k1, args.k2, args.scope_x, args.scope_y
        ).reshape(-1)
    ## 加入高斯噪声
    points += np.random.normal(0, args.noise_std, points.shape)
    top_point += np.random.normal(0, args.noise_std, top_point.shape)

    ## 归一化
    points /= np.linalg.norm(points, axis=1).reshape(-1, 1)
    top_point /= np.linalg.norm(top_point)

    return (
        {
            "points": points,
            "top_point": top_point,
            "hour_des": hour_des,
            "z": args.z,
        },
        geo,
    )


def destort(points_3d, k1, k2, scope_x, scope_y):
    """
    施加径向畸变
    params:
        points_3d: np.array, shape=(n, 3), 2D points
        k1: float, radial distortion coefficient
        k2: float, tangential distortion coefficient
        scope_x: tuple, x scope
        scope_y: tuple, y scope
    return:
        points: np.array, shape=(n, 3), 2D points
    """
    points_2d = points_3d[:, :2]
    z = points_3d[:, 2]
    center = np.array([scope_x[0] + scope_x[1], scope_y[0] + scope_y[1]]) / 2
    points_relative = points_2d - center
    r = np.hypot(points_relative[:, 0], points_relative[:, 1]).reshape(-1, 1)
    points_relative *= 1 + k1 * r**2 + k2 * r**4
    points_2d = points_relative + center
    points_3d = np.concatenate([points_2d, z.reshape(-1, 1)], axis=1)
    return points_3d


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
        ## 生成数据
        datas, real_geo = generate_datas(args)
        for name, method in methods.items():
            ## 计算地理坐标
            geo = method(deepcopy(datas))
            ## 计算误差，使用球面距离表示
            results[name]["error"].append(sph_dist(*geo, *real_geo) * 6371.939)
    ## 排序
    results = dict(
        sorted(results.items(), key=lambda x: np.mean(x[1]["error"]), reverse=True)
    )
    ## 输出结果
    print_results(results)


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.num_points = 5  # 点的数量
    args.num_tests = 1000  # 测试次数
    args.scope_x = (-1000, 1000)
    args.scope_y = (-2000, -1000)
    args.z = 3000  # 焦距
    args.k1 = 1e-9  # 畸变系数k1
    args.k2 = 1e-18  # 畸变系数k2
    args.noise_std = 1  # 高斯噪声标准差

    ## 检测是否有效范围
    assert args.scope_x[0] < args.scope_x[1]
    assert args.scope_y[0] < args.scope_y[1]

    ## 定义所需评测的方法
    methods = {
        "matrix_inverse": matrix_inverse,
        "bi_median": bi_median,
    }

    main(methods, args)
