import numpy as np
from . import median
from scipy.optimize import minimize


def objective_function(point: tuple, lines: list) -> float:
    """
    Objective function for optimization.
    params:
        point: tuple, (x, y)
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
    return:
        distance: float, sum of distance from point to lines
    """
    x, y = point
    total_distance = 0
    for line in lines:
        x1, y1 = line[0]
        x2, y2 = line[1]
        a = y2 - y1
        b = x1 - x2
        c = np.cross(line[1], line[0]).item()

        distance = (
            np.hypot(x1 - x2, y1 - y2)
            * np.abs(np.dot((a, b, c), (x, y, 1)))
            / np.hypot(a, b)
            / np.hypot(x - (x1 + x2) / 2, y - (y1 + y2) / 2)
        )
        total_distance += distance**2
    return distance


def intersection(lines: list) -> tuple:
    """
    Find the intersection point of given lines.
    params:
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
    return:
        intersection point (x, y)
    """
    ## 计算直线参数abc
    abc_lines = []
    for line in lines:
        x1, y1 = line[0]
        x2, y2 = line[1]
        a = y2 - y1
        b = x1 - x2
        c = np.cross(line[1], line[0]).item()
        abc_lines.append((a, b, c))
    abc_lines = np.array(abc_lines, dtype=np.float32)
    ## 优化求交点
    point = median.intersection(lines)
    res = minimize(objective_function, point, args=lines)
    return res.x
