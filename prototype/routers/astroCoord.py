import astronomy as ast
from datetime import datetime
from fastapi import APIRouter
from schemas import astroCoord
from core.astroCoord.calc import get_HaDec_by_names

router = APIRouter()


@router.post("/", response_model=astroCoord.AstroCoord)
def fetch(star_names: list[str], timestamp: float):
    """
    获取指定时间的天体坐标

    param:
        star_names: list[str] 天体名称列表
        timestamp: float 时间戳
    """
    time = ast.Time(
        (
            datetime.fromtimestamp(timestamp) - datetime.fromtimestamp(946728000)
        ).total_seconds()
        / 86400
    )
    return get_HaDec_by_names(star_names, time)
