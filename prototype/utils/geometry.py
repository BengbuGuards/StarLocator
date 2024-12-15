import numpy as np
from core.locator.utils.math import sph_dist


def stars_convert(stars):
    """
    Convert the stars to numpy arrays of (lon, lat) coordinates.
    """
    num_stars = len(stars)
    points = np.zeros((num_stars, 2), dtype=np.float32)
    hour_decs = np.zeros((num_stars, 2), dtype=np.float32)
    for i, star in enumerate(stars):
        points[i] = star.x, star.y
        hour_decs[i] = star.lon, star.lat

    return points, hour_decs


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
