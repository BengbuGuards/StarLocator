import numpy as np
from .top_point.methods.matrix_inverse import intersection
from .find_z.methods import trisect, fix_refraction
from .locator.methods.bi_median import get_geo
from .find_z.utils.math import angles_on_sphere, normalize
from .latitude.method.series2 import astronomic_latitude_to_geodetic_latitude


def calc_z(
    points: np.ndarray,
    hour_decs: np.ndarray,
    top_point: np.ndarray,
    is_fix_refraction: bool = False,
) -> float:
    """
    Find the z value.

    Params:
        points: (n, 2), star points
        hour_decs: (n, 2), hour & declinations
        top_point: (2,), top point
        is_fix_refraction: whether to fix refraction

    Returns:
        z: float, z value
    """

    thetas = angles_on_sphere(hour_decs)
    z_input_parameters = {"points": points, "thetas": thetas, "ra_decs": hour_decs}
    z = trisect.get_z(z_input_parameters)
    if is_fix_refraction:
        z = fix_refraction.get_z(z_input_parameters, z, top_point)
    return z


def calc_geo(
    photo: dict, is_fix_refraction: bool = False, is_fix_gravity: bool = False
) -> dict:
    """
    Find the geographical position.

    params:
        photo: a dict including:
            stars: list, star points
                    name: str, star name
                    x: float, x value
                    y: float, y value
                    lat: float, declination
                    lon: float, reverse of hour angle
            lines: (n, 2, 2), plumb lines
        is_fix_refraction: whether to fix refraction
        is_fix_gravity: whether to fix gravity
    return:
        a dict:
            detail: str, success or failed
            topPoint: (2,), top point
            z: float, z value
            lon: float, longitude
            lat: float, latitude
    """

    num_points = len(photo["stars"])
    points, hour_decs, _ = stars_convert(photo["stars"])

    # 计算灭点
    try:
        top_point = intersection(np.array(photo["lines"]))
    except:
        return {"detail": "灭点计算失败"}

    # 计算焦距
    try:
        z = calc_z(points, hour_decs, top_point, is_fix_refraction)
    except:
        return {"detail": "焦距计算失败"}

    # 计算地理位置
    points_3d = np.concatenate([points, np.ones((num_points, 1)) * z], axis=1)
    top_point_3d = np.array([*top_point, z])

    points_3d = normalize(points_3d)
    top_point_3d = normalize(top_point_3d)

    try:
        geo = get_geo(
            {
                "points": points_3d,
                "top_point": top_point_3d,
                "hour_decs": hour_decs,
                "z": z,
            },
            is_fix_refraction,
        )
    except:
        return {"detail": "地理位置计算失败"}

    if is_fix_gravity:
        geo[1] = np.deg2rad(
            astronomic_latitude_to_geodetic_latitude(np.rad2deg(geo[1]))
        )

    return {
        "detail": "success",
        "topPoint": top_point,
        "z": z,
        "lon": geo[0].item(),
        "lat": geo[1].item(),
    }


def stars_convert(stars: list[dict]) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """
    Convert the stars to numpy arrays of (lon, lat) coordinates.
    """
    num_stars = len(stars)
    star_names = [star["name"] for star in stars]
    points = np.zeros((num_stars, 2), dtype=np.float32)
    hour_decs = np.zeros((num_stars, 2), dtype=np.float32)
    for i, star in enumerate(stars):
        points[i] = star["x"], star["y"]
        hour_decs[i] = star["lon"], star["lat"]

    return points, hour_decs, star_names
