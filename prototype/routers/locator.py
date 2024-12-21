import numpy as np
from fastapi import APIRouter
from schemas import locator
from core.positioning.calc import calc_geo, stars_convert


router = APIRouter()


@router.post("/", response_model=locator.Position)
def calc_geo_by_data(
    data: locator.PointLines, isFixRefraction: bool = False, isFixGravity: bool = False
):
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

    geo = calc_geo(
        data.model_dump(),
        isFixRefraction=isFixRefraction,
        isFixGravity=isFixGravity,
    )

    return geo
