import numpy as np


def calculate_angle(p1, p2, z) -> np.ndarray:
    v1 = np.array([*p1, z])
    v2 = np.array([*p2, z])

    return np.arccos(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))


def get_z(datas: tuple) -> float:
    """
    Find the zenith point.

    params:
        datas: (points, thetas). points: list of points. thetas: list of angles in radians
    return:
        z: zenith point
    """
    points = datas["points"]
    thetas = datas["thetas"]

    f_left = 0
    f_right = 1e9

    cnt = len(points)
    for _ in range(100):
        delta = (f_right - f_left) / 3
        f_mid_left = f_left + delta
        f_mid_right = f_right - delta

        sum1 = 0
        sum2 = 0
        for i in range(cnt):
            for j in range(i + 1, cnt):
                angle1 = calculate_angle(points[i], points[j], f_mid_left)
                sum1 += (angle1 - thetas[i, j]) ** 2

                angle2 = calculate_angle(points[i], points[j], f_mid_right)
                sum2 += (angle2 - thetas[i, j]) ** 2

        if sum1 < sum2:
            f_right = f_mid_right
        else:
            f_left = f_mid_left

    return (f_left + f_right) / 2
