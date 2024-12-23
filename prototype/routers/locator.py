import numpy as np
from fastapi import APIRouter
from schemas import locator
from core.positioning.calc import calc_geo


router = APIRouter()


@router.post("", response_model=locator.Position)
def calc_geo_by_data(data: locator.LocatorRequest):
    """
    Find the geographical position.

    params:
        data:
            data: a dict including:
                stars: list, star points
                lines: (n, 2, 2), plumb lines
            isFixRefraction: whether to fix refraction
            isFixGravity: whether to fix gravity
    return:
        geo: dict, geographical position about longitude and latitude, and detail
    """

    geo = calc_geo(
        data.data.model_dump(),
        is_fix_refraction=data.isFixRefraction,
        is_fix_gravity=data.isFixGravity,
    )

    return geo
