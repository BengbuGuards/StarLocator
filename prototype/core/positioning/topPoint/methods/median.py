import numpy as np
from utils.plane import all_points_of_lines_intersection


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
    ## 计算中位数交点
    point = np.median(points, axis=0)
    return point
