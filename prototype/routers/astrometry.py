from typing import Annotated
from fastapi import APIRouter, Request, Form
from schemas import astrometry
from core.astrometry.extract import extract_stars
from io import BytesIO
from PIL import Image

from .limiter import limiter
from config import ASTROMETRY_RATE_LIMIT, MAX_UPLOAD_SIZE

router = APIRouter()


@router.post("/extractstars", response_model=astrometry.ExtractStarResponse)
@limiter.limit(ASTROMETRY_RATE_LIMIT)
def http_extract_stars(
    request: Request, data: Annotated[astrometry.ExtractStarRequest, Form()]
):
    """
    获取指定时间的天体时角和赤纬

    param:
        request: Request, slowapi必需
        data:
            image: File, 图像文件
            thresh: float, 星星检测阈值
            min_area: int, 最小星星面积
            clean: bool, 是否清洗图像
            clean_param: float, 清洗参数
    return:
        a dict:
            detail: str, 计算情况
            positions: list[list[float]] 星星位置列表
    """

    f = data.image.file.read()
    if len(f) > MAX_UPLOAD_SIZE:
        return {
            "detail": f"上传文件大小{len(f)}超过{MAX_UPLOAD_SIZE}字节",
            "positions": None,
        }
    try:
        image = Image.open(BytesIO(f))
    except Exception as e:
        return {
            "detail": str(e),
            "positions": None,
        }
    detail, positions = extract_stars(
        image, data.thresh, data.min_area, data.clean, data.clean_param
    )
    return {
        "detail": detail,
        "positions": positions,
    }
