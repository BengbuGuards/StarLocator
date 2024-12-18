import numpy as np


def vector_angle(vec1, vec2):
    cos_theta = np.dot(vec1, vec2.T) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    return np.arccos(cos_theta)


def normalize(vec):
    return vec / np.linalg.norm(vec)


def rad2deg(rad):
    return rad * 180 / np.pi


def deg2rad(deg):
    return deg * np.pi / 180


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
