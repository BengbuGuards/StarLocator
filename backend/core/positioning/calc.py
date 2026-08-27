import numpy as np

from core.utils import wrap_angle_in_deg

from .find_z.methods import fix_refraction, trisect
from .find_z.utils.math import angles_on_sphere, normalize
from .latitude.method.series2 import astronomic_latitude_to_geodetic_latitude
from .locator.methods.bi_median import get_geo
from .top_point.methods.matrix_inverse_normalized import intersection


def build_error_line_feature(lon_deg: float, lat_deg: float, shift_deg: float) -> dict:
    return {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [wrap_angle_in_deg(lon_deg - shift_deg), lat_deg],
                [wrap_angle_in_deg(lon_deg + shift_deg), lat_deg],
            ],
        },
        "properties": {
            "kind": "error-line",
            "shiftDeg": shift_deg,
        },
    }


def build_geojson(
    lon_deg: float, lat_deg: float, z: float, top_point: np.ndarray
) -> dict:
    shift = 0.125
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon_deg, lat_deg],
                },
                "properties": {
                    "name": "Here!",
                    "kind": "position",
                    "z": z,
                    "topPoint": top_point.tolist(),
                },
            },
            build_error_line_feature(lon_deg, lat_deg, shift),
        ],
    }


def top_point_from_horizon(
    horizon_pts: list[list[float]] | np.ndarray, z: float
) -> np.ndarray:
    """
    由地平线上的点拟合地平线，并计算天顶在照片中的位置（灭点）。

    Params:
        horizon_pts: (n, 2), 地平线上标注的点
        z: float, 焦距
    Returns:
        top_point: (2,), 灭点坐标
    """
    pts = np.asarray(horizon_pts, dtype=np.float64)
    center = pts.mean(axis=0)
    _, _, vt = np.linalg.svd(pts - center, full_matrices=False)
    a, b = vt[-1]  # 最小奇异值方向 = 地平线法向
    c = -(a * center[0] + b * center[1])  # 直线 a x + b y + c = 0
    if abs(c) < 1e-9:
        raise ValueError("地平线过于靠近光心，无法确定灭点")
    return np.array([z * z * a / c, z * z * b / c])


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
            horizon: (n, 2, 2), horizon line segments
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
    lines = photo.get("lines", [])
    horizon_pts = [p for seg in photo.get("horizon", []) for p in seg]

    has_plumb = len(lines) >= 2
    has_horizon = len(horizon_pts) >= 2
    if not has_plumb and not has_horizon:
        return {"detail": "请至少标注两条铅垂线或一条地平线"}

    if has_plumb:
        # 铅垂线模式：直线交点的灭点直接标定天顶
        try:
            top_point = intersection(np.array(lines))
        except Exception:
            return {"detail": "灭点计算失败"}
        try:
            z = calc_z(points, hour_decs, top_point, is_fix_refraction)
        except Exception:
            return {"detail": "焦距计算失败"}
    else:
        # 地平线模式：先由星点求焦距，再由地平线和焦距求灭点
        z_input_parameters = {
            "points": points,
            "thetas": angles_on_sphere(hour_decs),
            "ra_decs": hour_decs,
        }
        try:
            z = trisect.get_z(z_input_parameters)
        except Exception:
            return {"detail": "焦距计算失败"}
        try:
            top_point = top_point_from_horizon(horizon_pts, z)
        except Exception:
            return {"detail": "灭点计算失败"}
        if is_fix_refraction:
            try:
                z = fix_refraction.get_z(z_input_parameters, z, top_point)
            except Exception:
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
    except Exception:
        return {"detail": "地理位置计算失败"}

    if is_fix_gravity:
        geo[1] = np.deg2rad(
            astronomic_latitude_to_geodetic_latitude(np.rad2deg(geo[1]))
        )

    lon = geo[0].item()
    lat = geo[1].item()
    lon_deg = wrap_angle_in_deg(np.rad2deg(lon).item())
    lat_deg = np.rad2deg(lat).item()

    return {
        "detail": "success",
        "topPoint": top_point,
        "z": z,
        "lon": lon,
        "lat": lat,
        "geojson": build_geojson(lon_deg, lat_deg, z, top_point),
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
