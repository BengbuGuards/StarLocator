import numpy as np


def intersection(lines: np.ndarray) -> np.ndarray:
    """
    在 matrix_inverse 基础上改良：对直线方程的系数进行归一化
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

    lines_3d = np.dstack((lines, np.zeros((lines.shape[0], 2, 1))))
    C = np.cross(lines_3d[:, 0], lines_3d[:, 1])[:, 2]

    # 对直线方程的系数进行归一化
    for i in range(len(A)):
        a, b = A[i]
        c = C[i]
        m = a + b + c
        A[i] /= m
        C[i] /= m

    A_inv = np.linalg.pinv(A)

    point = A_inv @ C

    return point
