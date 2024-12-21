import numpy as np
from ...locator.utils.math import sph_dist


def vector_angle(vec1, vec2):
    cos_theta = np.dot(vec1, vec2.T) / (np.linalg.norm(vec1, axis=-1) * np.linalg.norm(vec2, axis=-1))
    return np.arccos(cos_theta)


def normalize(vec):
    return vec / np.linalg.norm(vec, axis=-1, keepdims=True)


def rad2deg(rad):
    return rad * 180 / np.pi


def deg2rad(deg):
    return deg * np.pi / 180


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


def minimize(func, lowerBound, upperBound, tolerance=1e-6, maxIter=100):
    for _ in range(maxIter):
        delta = (upperBound - lowerBound) / 3
        midLeft = lowerBound + delta
        midRight = upperBound - delta

        sum1 = func(midLeft)
        sum2 = func(midRight)

        if sum1 < sum2:
            upperBound = midRight
        else:
            lowerBound = midLeft

        if abs(upperBound - lowerBound) < tolerance:
            break

    return (lowerBound + upperBound) / 2
