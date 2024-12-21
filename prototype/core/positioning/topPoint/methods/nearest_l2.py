import numpy as np


def intersection(lines: list) -> tuple:
    """
    Find the intersection point of given lines.
    params:
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
    return:
        intersection point (x, y)
    """
    strt_points = np.zeros((lines.shape[0], 3))
    strt_points[:, 0:2] = lines[:, 0]
    vect = lines[:, 1] - lines[:, 0]
    vect = vect / np.linalg.norm(vect, axis=1)[:, np.newaxis]
    directions = np.zeros((lines.shape[0], 3))
    directions[:, 0:2] = vect

    n, dim = strt_points.shape

    G_left = np.tile(np.eye(dim), (n, 1))
    G_right = np.zeros((dim * n, n))

    for i in range(n):
        G_right[i * dim : (i + 1) * dim, i] = -directions[i, :]

    G = np.concatenate([G_left, G_right], axis=1)
    d = strt_points.reshape((-1, 1))

    m = np.linalg.inv(np.dot(G.T, G)).dot(G.T).dot(d)

    return m[:2].flatten()
    # return m
