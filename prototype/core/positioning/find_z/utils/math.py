import numpy as np
from ...locator.utils.math import sph_dist


def normalize(vec):
    return vec / np.linalg.norm(vec, axis=-1, keepdims=True)


def angles_on_sphere(dec_ras):
    """
    Calculate the angles between points on a sphere. The dec_ras are represented as
        arrays of (lon, lat) coordinates.
    """
    num_points = dec_ras.shape[0]
    thetas = np.zeros((num_points, num_points), dtype=np.float32)
    for i in range(num_points):
        for j in range(i + 1, num_points):
            thetas[i, j] = sph_dist(*dec_ras[i], *dec_ras[j])
            thetas[j, i] = thetas[i, j]

    return thetas


def minimize(func, lower_bound, upper_bound, tolerance=1e-6, max_iter=100):
    for _ in range(max_iter):
        delta = (upper_bound - lower_bound) / 3
        mid_left = lower_bound + delta
        mid_right = upper_bound - delta

        sum1 = func(mid_left)
        sum2 = func(mid_right)

        if sum1 < sum2:
            upper_bound = mid_right
        else:
            lower_bound = mid_left

        if abs(upper_bound - lower_bound) < tolerance:
            break

    return (lower_bound + upper_bound) / 2
