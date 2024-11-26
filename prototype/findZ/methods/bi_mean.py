import numpy as np


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
    n = len(points)
    z_list = []
    for i in range(n):
        for j in range(i + 1, n):
            z = get_z_from_2_points(points[i], points[j], thetas[i][j])
            z_list.extend(z)
    z = reject_outliers(z_list)
    # print(z_list)
    return np.mean(z)


def get_z_from_2_points(p1: tuple, p2: tuple, theta: float) -> float:
    """
    Find the zenith point from 2 points and the angle between them.

    params:
        p1: point 1
        p2: point 2
        theta: angle between p1 and p2 in radians
    return:
        z: zenith point
    """

    x1, y1 = p1
    x2, y2 = p2
    a = np.cos(theta) ** 2 - 1
    b = (x1**2 + y1**2 + x2**2 + y2**2) * np.cos(theta) ** 2 - 2 * (x1 * x2 + y1 * y2)
    c = (x1**2 + y1**2) * (x2**2 + y2**2) * np.cos(theta) ** 2 - (
        x1 * x2 + y1 * y2
    ) ** 2
    delta = b**2 - 4 * a * c

    if delta < 0:
        return []

    sqrt_delta = np.sqrt(delta)
    solve1 = (-b + sqrt_delta) / (2 * a)
    solve2 = (-b - sqrt_delta) / (2 * a)

    if (
        solve1 >= 0
        and solve2 >= 0
        and (x1 * x2 + y1 * y2 + solve1) * (x1 * x2 + y1 * y2 + solve2) > 0
    ):
        return [np.sqrt(solve1), np.sqrt(solve2)]
    if solve1 >= 0 and (x1 * x2 + y1 * y2 + solve1) * np.cos(theta) > 0:
        return [np.sqrt(solve1)]
    if solve2 >= 0 and (x1 * x2 + y1 * y2 + solve2) * np.cos(theta) > 0:
        return [np.sqrt(solve2)]

    return []


def reject_outliers(data: list, sigma: float = 2.0) -> list:
    """
    Reject the outliers in the data.

    params:
        data: list of data
        sigma: the number of standard deviations from the mean to reject the outliers
    return:
        data: list of data without outliers
    """
    data = np.array(data)
    return data[
        (data > np.mean(data) - sigma * np.std(data))
        & (data < np.mean(data) + sigma * np.std(data))
    ]
