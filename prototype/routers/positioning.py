from fastapi import APIRouter, Request
from schemas import positioning
from core.positioning.calc import calc_geo

from .limiter import limiter
from config import POSITIONING_RATE_LIMIT

router = APIRouter()


@router.post("", response_model=positioning.PositioningResponse)
@limiter.limit(POSITIONING_RATE_LIMIT)
def calc_geo_by_data(request: Request, data: positioning.PositioningRequest):
    """
    Find the geographical position.

    params:
        request: Request, slowapi必需
        data:
            photo: a dict including:
                stars: list, star points
                    name: str, star name
                    x: float, x value
                    y: float, y value
                    lat: float, declination
                    lon: float, reverse of hour angle
                lines: (n, 2, 2), plumb lines
            isFixRefraction: whether to fix refraction
            isFixGravity: whether to fix gravity
    return:
        a dict:
            detail: str, success or failed
            topPoint: (2,), top point
            z: float, z value
            lon: float, longitude
            lat: float, latitude
    """

    geo = calc_geo(
        data.photo.model_dump(),
        is_fix_refraction=data.isFixRefraction,
        is_fix_gravity=data.isFixGravity,
    )

    return geo
