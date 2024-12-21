from fastapi import APIRouter
from core.moonTime.calc import calc
from schemas import locator

router = APIRouter()


@router.post("/", response_model=float)
def calc_time_by_moon(
    data: locator.PointLines,
    approxTimestamp: float,
    scopeDays: float,
    isFixRefraction: bool = False,
    isFixGravity: bool = False,
):
    """
    通过月亮与星星的相对位置计算时间

    param:
        data: a dict including:
            stars: list, star points
            lines: (n, 2, 2), plumb lines
        approxTimestamp: number, approximate timestamp
        scopeDays: number, date search range size (in days)
        isFixRefraction: whether to fix refraction
        isFixGravity: whether to fix gravity
    return:
        float, the timestamp
    """
    time = calc(
        data.model_dump(), approxTimestamp, scopeDays, isFixGravity=isFixGravity, isFixRefraction=isFixRefraction
    )
    return time
