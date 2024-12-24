import numpy as np
from ..utils.plane import all_points_of_lines_intersection


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
        c = np.cross(line[1], line[0])
        abc_lines.append((a, b, c))
    abc_lines = np.array(abc_lines, dtype=np.float32)
    ## 计算每个交点到每条线的距离
    weights = []
    for point in points:
        x, y = point
        weight = 0
        for abc in abc_lines:
            a, b, c = abc
            tmp = np.abs(np.dot(abc, np.array([x, y, 1])))
            if tmp < 1e-5:
                continue
            # distance += np.abs(a*x + b*y + c) / np.sqrt(a**2 + b**2)
            weight += a**2 + b**2 / tmp**2
        weights.append(weight)
    weights = np.array(weights, dtype=np.float32)
    ## 计算加权交点
    point = np.average(points, axis=0, weights=weights)
    return point
