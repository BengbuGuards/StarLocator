from fastapi import APIRouter, Request
from schemas import astro_coord
from core.astro_coord.calc import get_HaDecs_by_names

from .limiter import limiter
from config import ASTRO_COORD_RATE_LIMIT

router = APIRouter()


@router.post("", response_model=astro_coord.AstroCoord)
@limiter.limit(ASTRO_COORD_RATE_LIMIT)
def http_astro_coord(request: Request, data: astro_coord.AstroTime):
    """
    获取指定时间的天体时角和赤纬

    param:
        request: Request, slowapi必需
        data:
            star_names: list[str] 天体名称列表
            timestamp: number 时间戳
    return:
        a dict:
            detail: str, 计算情况
            haDecs: list[float | None] 各天体的时角和赤纬列表（角度）
    """

    haDecs, detail = get_HaDecs_by_names(data.starNames, data.timestamp)
    return {
        "detail": detail,
        "haDecs": haDecs,
    }
