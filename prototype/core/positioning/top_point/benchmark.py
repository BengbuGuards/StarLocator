import argparse

import numpy as np
import scipy.stats as st
from methods.least_square import intersection as least_square
from methods.matrix_inverse import intersection as matrix_inverse
from methods.median import intersection as median
from methods.median2 import intersection as median2
from methods.nearest_l2 import intersection as nearest_l2
from methods.optim import intersection as optim
from methods.sphere import intersection as sphere
from methods.square_weight import intersection as square_weight
from utils.rand import rand_range


def generate_lines(args):
    # 实际的灭点就在原点上
    num_lines = args.num_lines
    scope_x = args.scope_x
    scope_y = args.scope_y
    alpha = args.alpha
    ## 生成线的两点
    lines = []
    for i in range(num_lines):
        ## 生成一个参考点
        x0 = 0
        while np.abs(x0) < 1e-2:
            x0 = rand_range(*scope_x)
        y0 = 0
        while np.abs(y0) < 1e-2:
            y0 = rand_range(*scope_y)
        ## 生成范围
        if y0 / x0 > 0:
            limit_x1 = np.max((scope_x[0], scope_y[0] / y0 * x0))
            limit_x2 = np.min((scope_x[1], scope_y[1] / y0 * x0))
        else:
            limit_x1 = np.max((scope_x[0], scope_y[1] / y0 * x0))
            limit_x2 = np.min((scope_x[1], scope_y[0] / y0 * x0))
        ## 生成两个点
        rand = np.random.random() * alpha + (1 - alpha)
        x1 = rand * limit_x1 + (1 - rand) * limit_x2
        y1 = y0 / x0 * x1
        rand = np.random.random() * alpha + (1 - alpha)
        x2 = rand * limit_x2 + (1 - rand) * limit_x1
        y2 = y0 / x0 * x2
        lines.append(((x1, y1), (x2, y2)))
    lines = np.array(lines, dtype=np.float32)
    ## 施加径向畸变
    if args.k1 is not None and args.k2 is not None:
        lines = destort(lines, args.k1, args.k2, args.scope_x, args.scope_y)
    ## 加入高斯噪声
    lines += np.random.normal(0, args.noise_std, lines.shape)
    return lines


def destort(lines, k1, k2, scope_x, scope_y):
    """
    施加径向畸变
    params:
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
        k1: float, radial distortion coefficient
        k2: float, tangential distortion coefficient
        scope_x: tuple, x scope
        scope_y: tuple, y scope
    return:
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
    """
    lines = lines.reshape(-1, 2)
    center = np.array([scope_x[0] + scope_x[1], scope_y[0] + scope_y[1]]) / 2
    lines_relative = lines - center
    r = np.hypot(lines_relative[:, 0], lines_relative[:, 1]).reshape(-1, 1)
    lines_relative *= 1 + k1 * r**2 + k2 * r**4
    lines = lines_relative + center
    lines = lines.reshape(-1, 2, 2)
    return lines


def print_results(results):
    ## 输出结果
    for name, result in results.items():
        print("Method:", name)
        error = np.array(result["error"])
        error_x = np.array(result["error_x"])
        error_y = np.array(result["error_y"])
        # print('Mean error:', np.mean(error), 'Std:', np.std(error, ddof=1))
        print(
            "\tMean error:",
            np.mean(error),
            "Interval:",
            st.t.interval(
                0.95, len(error) - 1, loc=np.mean(error), scale=st.sem(error)
            ),
        )
        print(
            "\t\tMean error_x:",
            np.mean(error_x),
            "Interval:",
            st.t.interval(
                0.95, len(error_x) - 1, loc=np.mean(error_x), scale=st.sem(error_x)
            ),
        )
        print(
            "\t\tMean error_y:",
            np.mean(error_y),
            "Interval:",
            st.t.interval(
                0.95, len(error_y) - 1, loc=np.mean(error_y), scale=st.sem(error_y)
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
        results[name] = {"error": [], "error_x": [], "error_y": []}
    for _ in range(args.num_tests):
        ## 生成线的两点
        lines = generate_lines(args)
        for name, method in methods.items():
            ## 计算灭点
            point = method(lines.copy())
            ## 计算误差
            results[name]["error"].append(np.hypot(*point))
            results[name]["error_x"].append(point[0])
            results[name]["error_y"].append(point[1])
    ## 排序
    results = dict(
        sorted(results.items(), key=lambda x: np.mean(x[1]["error"]), reverse=True)
    )
    ## 输出结果
    print_results(results)


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.num_lines = 10  # 线的数量
    args.num_tests = 3000  # 测试次数
    args.scope_x = (-300, 300)
    args.scope_y = (-2000, -1000)
    args.alpha = 0.2  # 0~1，越大时两点的距离越接近
    args.k1 = 1e-7  # 畸变系数
    args.k2 = 1e-14  # 畸变系数
    args.noise_std = 1  # 高斯噪声标准差

    ## 检测是否有效范围
    assert args.scope_x[0] < args.scope_x[1]
    assert args.scope_y[0] < args.scope_y[1]

    ## 定义所需评测的方法
    methods = {
        "median2": median2,
        "median": median,
        "sphere": sphere,
        # "square_weight": square_weight,
        "least_square": least_square,
        # "nearest_l2": nearest_l2,
        "matrix_inverse": matrix_inverse,
        # "optim": optim,
    }

    main(methods, args)
