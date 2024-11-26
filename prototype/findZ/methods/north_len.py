import numpy as np


def north_len(points: np.ndarray, des: np.ndarray, f: float) -> float:
    """
    Calculate the length of the north pole.

    params:
        points: list of points
        des: list of declinations
        f: zenith point
    return:
        length: length of the north pole
    """
    C = np.concatenate([points, np.ones((points.shape[0], 1)) * f], axis=1)
    C_normlized = C / np.linalg.norm(C, axis=1)[:, None]
    D = np.sin(des)
    N = np.linalg.pinv(C_normlized) @ D
    return np.linalg.norm(N)

def get_z(datas: tuple) -> float:
    """
    Find the zenith point.

    params:
        datas: (points, thetas). points: list of points. thetas: list of angles in radians
    return:
        z: zenith point
    """
    points = datas["points"]
    des = datas["des"]

    f_left = 0
    f_right = 1e9
    
    for _ in range(100):
        delta = (f_right - f_left) / 3
        f_mid_left = f_left + delta
        f_mid_right = f_right - delta

        error_sum1 = np.abs(north_len(points, des, f_mid_left) - 1)
        error_sum2 = np.abs(north_len(points, des, f_mid_right) - 1)

        if error_sum1 < error_sum2:
            f_right = f_mid_right
        else:
            f_left = f_mid_left

    f = (f_left + f_right) / 2
    return f
