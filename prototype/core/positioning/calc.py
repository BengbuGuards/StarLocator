import numpy as np
from .topPoint.methods.matrix_inverse import intersection
from .findZ.methods import trisect, fix_refraction
from .locator.methods.bi_median import get_geo
from .findZ.utils.math import angles_on_sphere, normalize


def calc_z(points, hour_decs, top_point, isFixRefraction=False):
    """
    Find the z value.

    params:
        points: (n, 2), star points
        hour_decs: (n, 2), hour & declinations
        top_point: (2,), top point
        isFixRefraction: whether to fix refraction
    return:
        z: float, z value
    """

    thetas = angles_on_sphere(hour_decs)
    z_input_parameters = {"points": points, "thetas": thetas, "ra_decs": hour_decs}
    z = trisect.get_z(z_input_parameters)
    if isFixRefraction:
        z = fix_refraction.get_z(z_input_parameters, z, top_point)
    return z


def calc_geo(data, isFixRefraction=False, isFixGravity=False):
    """
    Find the geographical position.

    params:
        data: a dict including:
            stars: list, star points
            lines: (n, 2, 2), plumb lines
        isFixRefraction: whether to fix refraction
        isFixGravity: whether to fix gravity
    return:
        geo: dict, geographical position about longitude and latitude
    """

    num_points = len(data['stars'])
    points, hour_decs, _ = stars_convert(data['stars'])

    # 计算灭点
    top_point = intersection(np.array(data['lines']))

    # 计算焦距
    z = calc_z(points, hour_decs, top_point, isFixRefraction)

    # 计算地理位置
    points_3d = np.concatenate([points, np.ones((num_points, 1)) * z], axis=1)
    top_point_3d = np.array([*top_point, z])

    points_3d = normalize(points_3d)
    top_point_3d = normalize(top_point_3d)

    geo = get_geo(
        {
            "points": points_3d,
            "top_point": top_point_3d,
            "hour_decs": hour_decs,
            "z": z,
        },
        isFixRefraction,
    )

    if isFixGravity:
        geo[1] = (
            geo[1]
            - (
                0.00032712 * np.sin(geo[1]) ** 2
                - 0.00000368 * np.sin(geo[1])
                - 0.099161
            )
            * np.sin(geo[1] * 2)
            / 180
            * np.pi
        )

    return {"lon": geo[0].item(), "lat": geo[1].item()}


def stars_convert(stars):
    """
    Convert the stars to numpy arrays of (lon, lat) coordinates.
    """
    num_stars = len(stars)
    star_names = [star['name'] for star in stars]
    points = np.zeros((num_stars, 2), dtype=np.float32)
    hour_decs = np.zeros((num_stars, 2), dtype=np.float32)
    for i, star in enumerate(stars):
        points[i] = star['x'], star['y']
        hour_decs[i] = star['lon'], star['lat']

    return points, hour_decs, star_names
