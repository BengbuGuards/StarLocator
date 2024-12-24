import numpy as np
from ..utils.plane import all_points_of_lines_intersection


def least_squares_fit(points):
    # 提取x和y坐标
    x = points[:, 0]
    y = points[:, 1]

    # 计算x和y的均值
    mean_x = np.mean(x)
    mean_y = np.mean(y)

    # 计算斜率k和截距b所需要的总和
    numerator = np.sum((x - mean_x) * (y - mean_y))
    denominator = np.sum((x - mean_x) ** 2)

    # 计算斜率k
    k = numerator / denominator

    # 计算截距b
    b = mean_y - k * mean_x

    return k, b


def intersection(lines: list) -> tuple:
    """
    Find the intersection point of given lines.
    params:
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
    return:
        intersection point (x, y)
    """
    ## 计算每两条线的交点
    points = all_points_of_lines_intersection(lines)

    points = np.array(points, dtype=np.float32)
    ## 计算直线参数abc
    abc_lines = []
    for line in lines:
        x1, y1 = line[0]
        x2, y2 = line[1]
        a = y2 - y1
        b = x1 - x2
        c = np.cross(line[1], line[0]).item()
        if np.abs(a) < 1e-5:
            continue
        abc_lines.append((b / a, c / a))
    abc_lines = np.array(abc_lines, dtype=np.float32)
    ## 最小二乘拟合
    line_k, line_b = least_squares_fit(abc_lines)
    return line_k, line_b
