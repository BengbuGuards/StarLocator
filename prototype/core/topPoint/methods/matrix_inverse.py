import numpy as np


def intersection(lines: list) -> tuple:
    V = lines[:, 1] - lines[:, 0]

    A = np.zeros_like(V)
    A[:, 0] = V[:, 1]
    A[:, 1] = -V[:, 0]

    b = np.cross(lines[:, 0], lines[:, 1])

    A_inv = np.linalg.pinv(A)

    point = A_inv @ b

    return point
