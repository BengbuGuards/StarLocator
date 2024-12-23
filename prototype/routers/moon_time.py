from fastapi import APIRouter
from core.moon_time.calc import calc
from schemas import moon_time

router = APIRouter()


@router.post("", response_model=moon_time.MoonTimeResponse)
def calc_time_by_moon(data: moon_time.MoonTimeRequest):
    """
    通过月亮与星星的相对位置计算时间

    param:
        data:
            data: a dict including:
                stars: list, star points
                lines: (n, 2, 2), plumb lines
            approxTimestamp: number, approximate timestamp
            scopeDays: number, date search range size (in days)
            isFixRefraction: whether to fix refraction
            isFixGravity: whether to fix gravity
    return:
        a dict:
            time: float, the timestamp
            detail: str, the detail of the calculation
    """
    detail = "success"
    try:
        time = calc(
            data.data.model_dump(),
            data.approxTimestamp,
            data.scopeDays,
            is_fix_gravity=data.isFixGravity,
            is_fix_refraction=data.isFixRefraction,
        )
    except Exception as e:
        time = None
        detail = str(e)
    return {"time": time, "detail": detail}
