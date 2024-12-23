from fastapi import APIRouter, Request
from schemas import positioning
from core.positioning.calc import calc_geo

from .limiter import limiter
from config import POSITIONING_RATE_LIMIT

router = APIRouter()


@router.post("", response_model=positioning.Position)
@limiter.limit(POSITIONING_RATE_LIMIT)
def calc_geo_by_data(request: Request, data: positioning.LocatorRequest):
    """
    Find the geographical position.

    params:
        request: Request, slowapi必需
        data:
            photo: a dict including:
                stars: list, star points
                lines: (n, 2, 2), plumb lines
            isFixRefraction: whether to fix refraction
            isFixGravity: whether to fix gravity
    return:
        geo: dict, geographical position about longitude and latitude, and detail
    """

    geo = calc_geo(
        data.photo.model_dump(),
        is_fix_refraction=data.isFixRefraction,
        is_fix_gravity=data.isFixGravity,
    )

    return geo
