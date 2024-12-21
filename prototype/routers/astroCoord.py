from fastapi import APIRouter
from schemas import astroCoord
from core.astroCoord.calc import get_HaDec_by_names

router = APIRouter()


@router.post("/", response_model=astroCoord.AstroCoord)
def calc_astro_coord(star_names: list[str], timestamp: float):
    """
    获取指定时间的天体坐标

    param:
        star_names: list[str] 天体名称列表
        timestamp: number 时间戳
    """
    
    return get_HaDec_by_names(star_names, timestamp)
