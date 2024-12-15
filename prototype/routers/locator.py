import numpy as np
from fastapi import APIRouter
from schemas import locator
from utils.geometry import stars_convert, angles_on_sphere
from core.topPoint.methods.matrix_inverse import intersection
from core.findZ.methods.trisect import get_z
from core.locator.methods.bi_median import get_geo

router = APIRouter()


@router.post("/", response_model=locator.Position)
def calc_geo(data: locator.PointLines):
    num_points = len(data.stars)
    points, hour_decs = stars_convert(data.stars)
    lines = np.array(data.lines)

    # 计算灭点
    top_point = intersection(lines)

    # 计算焦距
    thetas = angles_on_sphere(hour_decs)
    z = get_z({"points": points, "thetas": thetas})

    # 计算地理位置
    points_3d = np.concatenate([points, np.ones((num_points, 1)) * z], axis=1)
    top_point_3d = np.array([*top_point, z])
    
    points_3d = points_3d / np.linalg.norm(points_3d, axis=1, keepdims=True)
    top_point_3d = top_point_3d / np.linalg.norm(top_point_3d)

    geo = get_geo(
        {"points": points_3d, "top_point": top_point_3d, "hour_decs": hour_decs, "z": z}
    )

    return {"lon": geo[0].item(), "lat": geo[1].item()}
