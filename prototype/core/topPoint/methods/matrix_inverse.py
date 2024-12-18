import numpy as np


def intersection(lines: list) -> tuple:
    """
    Find the intersection point of given lines.
    params:
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
    return:
        intersection point (x, y)
    """
    V = lines[:, 1] - lines[:, 0]

    A = np.zeros_like(V)
    A[:, 0] = V[:, 1]
    A[:, 1] = -V[:, 0]

    b = np.cross(lines[:, 0], lines[:, 1])

    A_inv = np.linalg.pinv(A)

    point = A_inv @ b

    return point
