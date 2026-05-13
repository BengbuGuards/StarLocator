from fastapi import APIRouter, Request
from core.moon_time.calc import calc
from schemas import moon_time
import asyncio

from .limiter import limiter
from config import HEAVY_RATE_LIMIT

router = APIRouter()


@router.post("", response_model=moon_time.MoonTimeResponse)
@limiter.limit(HEAVY_RATE_LIMIT)
async def http_time_by_moon(request: Request, data: moon_time.MoonTimeRequest):
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
        time = await asyncio.to_thread(
            calc,
            data.photo.model_dump(),
            data.approxTimestamp,
            data.scopeDays,
            data.isFixGravity,
            data.isFixRefraction,
        )
    except ValueError as e:
        time = None
        detail = str(e)
    except Exception:
        time = None
        detail = "时间计算过程中发生未知矩阵运算错误，请检查传入点位是否合理"
    return {"time": time, "detail": detail}
