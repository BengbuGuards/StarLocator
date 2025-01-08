from fastapi import APIRouter, Request
from core.moon_time.calc import calc
from schemas import moon_time

from .limiter import limiter
from config import HEAVY_RATE_LIMIT

router = APIRouter()


@router.post("", response_model=moon_time.MoonTimeResponse)
@limiter.limit(HEAVY_RATE_LIMIT)
def http_time_by_moon(request: Request, data: moon_time.MoonTimeRequest):
    """
    通过月亮与星星的相对位置计算时间

    Params:
        request: Request, slowapi必需
        data:
            photo: a dict including:
                stars: list, star points
                lines: (n, 2, 2), plumb lines
            approxTimestamp: number, approximate timestamp
            scopeDays: number, date search range size (in days)
            isFixRefraction: whether to fix refraction
            isFixGravity: whether to fix gravity
    
    Returns:
        a dict:
            time: float, the timestamp
            detail: str, the detail of the calculation
    """
    detail = "success"
    try:
        time = calc(
            data.photo.model_dump(),
            data.approxTimestamp,
            data.scopeDays,
            is_fix_gravity=data.isFixGravity,
            is_fix_refraction=data.isFixRefraction,
        )
    except Exception as e:
        time = None
        detail = str(e)
    return {"time": time, "detail": detail}
