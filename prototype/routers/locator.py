import numpy as np
from fastapi import APIRouter
from schemas import locator
from utils.math import stars_convert, angles_on_sphere, normalize, rad2Deg
from core.topPoint.methods.matrix_inverse import intersection
from core.findZ.methods import trisect, fix_refraction
from core.locator.methods.bi_median import get_geo

router = APIRouter()


@router.post("/", response_model=locator.Position)
def calc_geo(
    data: locator.PointLines, isFixRefraction: bool = False, isFixGravity: bool = False
):
    """
    Find the geographical position.

    params:
        datas: a dict including:
            points: (n, 2), star points
            lines: (n, 2, 2), plumb lines
        isFixRefraction: whether to fix refraction
        isFixGravity: whether to fix gravity
    return:
        geo: dict, geographical position about longitude and latitude
    """

    num_points = len(data.stars)
    points, hour_decs = stars_convert(data.stars)
    lines = np.array(data.lines)

    # 计算灭点
    top_point = intersection(lines)

    # 计算焦距
    thetas = angles_on_sphere(hour_decs)
    z_input_parameters = {"points": points, "thetas": thetas, "ra_decs": hour_decs}
    z = trisect.get_z(z_input_parameters)
    if isFixRefraction:
        z = fix_refraction.get_z(z_input_parameters, z, top_point)

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
        geo[1] = geo[1] - (
            0.00032712 * np.sin(geo[1]) ** 2 - 0.00000368 * np.sin(geo[1]) - 0.099161
        ) * np.sin(geo[1] * 2) / 180 * np.pi

    return {"lon": geo[0].item(), "lat": geo[1].item()}
