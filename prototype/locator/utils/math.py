import numpy as np


def vector_angle(vec1, vec2):
    cos_theta = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    cos_theta = np.clip(cos_theta, -1, 1)
    return np.arccos(cos_theta)


def cart2sph(x, y, z):
    hxy = np.hypot(x, y)
    r = np.hypot(hxy, z)
    elev = np.arctan2(z, hxy)  # for elevation angle defined from Z-axis down
    az = np.arctan2(y, x)
    return az, elev, r
