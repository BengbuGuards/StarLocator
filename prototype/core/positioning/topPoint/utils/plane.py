import numpy as np


def two_line_intersection_point(l1, l2):
    p1 = np.array(l1[0])
    p2 = np.array(l1[1])
    p3 = np.array(l2[0])
    p4 = np.array(l2[1])

    v1 = p2 - p1
    v2 = p4 - p3
    v3 = p3 - p1

    det = v1[0] * v2[1] - v1[1] * v2[0]
    if det == 0:
        return False, np.array([0, 0])

    t = (v3[0] * v2[1] - v3[1] * v2[0]) / det
    res = p1 + t * v1
    return True, res


def all_points_of_lines_intersection(lines):
    points = []
    for i in range(len(lines)):
        for j in range(i + 1, len(lines)):
            has_intersection, intersection_point = two_line_intersection_point(
                lines[i], lines[j]
            )
            if has_intersection:
                points.append(intersection_point)

    return points
