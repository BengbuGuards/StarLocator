from fastapi import APIRouter, Request
from schemas import astro_coord
from core.astro_coord.calc import get_HaDecs_by_names

from .limiter import limiter
from config import ASTRO_COORD_RATE_LIMIT

router = APIRouter()


@router.post("", response_model=astro_coord.AstroCoord)
@limiter.limit(ASTRO_COORD_RATE_LIMIT)
def calc_astro_coord(request: Request, data: astro_coord.AstroTime):
    """
    获取指定时间的天体坐标

    param:
        request: Request, slowapi必需
        data:
            star_names: list[str] 天体名称列表
            timestamp: number 时间戳
    return:
        a dict:
            is_success: bool 是否成功
            haDecs: list[float | None] 天体坐标列表
    """

    haDecs, detail = get_HaDecs_by_names(data.starNames, data.timestamp)
    return {
        "detail": detail,
        "haDecs": haDecs,
    }
