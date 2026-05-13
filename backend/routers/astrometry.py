from typing import Annotated
from fastapi import APIRouter, Request, Response, Form
from fastapi.responses import StreamingResponse
from schemas.astrometry.extract_stars import ExtractStarRequest, ExtractStarResponse
from schemas.astrometry.recognize import RecognizeRequest, RecognizeResponse
from schemas.astrometry.submit import SubmitRequest, SubmitResponse, RecognizeStreamRequest
from core.astrometry.extract import extract_stars
from core.astrometry.solve import recognize
from core.astrometry.solve import submit
from io import BytesIO
from PIL import Image
import json
import httpx

import asyncio
from core.utils.http import get_http_client
from .limiter import limiter
from config import LIGHT_RATE_LIMIT, MEDIUM_RATE_LIMIT, MAX_UPLOAD_SIZE

router = APIRouter()


@router.post("/extractstars", response_model=ExtractStarResponse)
@limiter.limit(LIGHT_RATE_LIMIT)
async def http_extract_stars(request: Request, data: Annotated[ExtractStarRequest, Form()]):
    """
    获取图像中的星星位置

    Params:
        request: Request, slowapi必需
        data:
            image: File, 图像文件
            thresh: float, 星星检测阈值
            min_area: int, 最小星星面积
            clean: bool, 是否清洗图像
            clean_param: float, 清洗参数

    Returns:
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
        image = await asyncio.to_thread(Image.open, BytesIO(f))
    except Exception:
        return {
            "detail": "图像格式不支持或文件已损坏",
            "positions": None,
        }
    detail, positions = await asyncio.to_thread(
        extract_stars, image, data.thresh, data.min_area, data.clean, data.clean_param
    )
    return {
        "detail": detail,
        "positions": positions,
    }


@router.post("/submit", response_model=SubmitResponse)
@limiter.limit(MEDIUM_RATE_LIMIT)
async def http_submit(request: Request, data: Annotated[SubmitRequest, Form()]):
    """
    提交图像中的星星位置以让Astrometry.net解析

    Args:
        request: Request, slowapi必需
        data:
            sub_images: list[UploadFile], 必需, 星星周围的图像
            xy: list[Coordinate], 必需, 图像中星星的位置
            image_width: int, 必需, 原始图像的宽度
            image_height: int, 必需, 原始图像的高度
            scale_units: str, 可选, 缩放宽度的单位
            scale_lower: float, 可选, 缩放宽度的下限
            scale_upper: float, 可选, 缩放宽度的上限

    Returns:
        a dict:
            detail: str, 计算情况
            job_id: str | None, 提交的任务id
    """

    sub_images = []
    for sub_image in data.sub_images:
        f = sub_image.file.read()
        if len(f) > MAX_UPLOAD_SIZE:
            return {
                "detail": f"上传文件大小{len(f)}超过{MAX_UPLOAD_SIZE}字节",
                "job_id": None,
            }
        try:
            image = await asyncio.to_thread(Image.open, BytesIO(f))
        except Exception:
            return {
                "detail": "上传的图像格式不支持或文件已损坏",
                "job_id": None,
            }
        sub_images.append(image)
    xy = json.loads(data.xy)
    image_width = data.image_width
    image_height = data.image_height
    scale_units = data.scale_units
    scale_lower = data.scale_lower
    scale_upper = data.scale_upper

    detail, job_id = await asyncio.to_thread(
        submit, sub_images, xy, image_width, image_height, scale_units, scale_lower, scale_upper
    )

    return {"detail": detail, "job_id": job_id}


@router.get("/jobidstatus/{job_id}")
async def http_jobid_status(request: Request, job_id: str):
    """
    获取任务的状态

    Args:
        request: Request, slowapi必需
        job_id: str, 提交的任务id

    Returns:
        a str, Astrometry的响应结果
    """
    client = get_http_client()
    response = await client.get(f"http://nova.astrometry.net/api/jobs/{job_id}")
    return Response(content=response.text, status_code=response.status_code)


@router.post("/recognize", response_model=RecognizeResponse)
@limiter.limit(MEDIUM_RATE_LIMIT)
async def http_recognize(request: Request, data: RecognizeRequest):
    """
    解析Astrometry.net返回的结果

    Args:
        request: Request, slowapi必需
        data:
            job_id: str, 提交的任务id
            xy: list[Coordinate], x, y坐标
            timestamp: float, 图像的时间戳
            radius: float, 搜索半径
            max_mag: float, 最大星等
            is_zh: bool, 是否使用中文星名

    Returns:
        a dict:
            detail: str, 计算情况
            hd_names: list[tuple[float, float, str]] | None, HA, Dec, 星名
    """

    detail, hd_names = await recognize(
        data.job_id,
        data.xy,
        data.timestamp,
        radius=data.radius,
        max_mag=data.max_mag,
        is_zh=data.is_zh,
    )

    return {"detail": detail, "hd_names": hd_names}
@router.post("/recognize-stream")
@limiter.limit(MEDIUM_RATE_LIMIT)
async def http_recognize_stream(request: Request, data: Annotated[RecognizeStreamRequest, Form()]):
    """
    提交图像并自动轮询解析结果（SSE流式响应）
    """
    async def event_generator():
        try:
            sub_images = []
            for sub_image in data.sub_images:
                f = sub_image.file.read()
                if len(f) > MAX_UPLOAD_SIZE:
                    yield f"data: {json.dumps({'step': 'error', 'detail': f'上传文件大小{len(f)}超过{MAX_UPLOAD_SIZE}字节'})}\n\n"
                    return
                try:
                    image = await asyncio.to_thread(Image.open, BytesIO(f))
                except Exception:
                    yield f"data: {json.dumps({'step': 'error', 'detail': '上传的图像格式不支持或文件已损坏'})}\n\n"
                    return
                sub_images.append(image)
            
            xy = json.loads(data.xy)
            detail, job_id = await asyncio.to_thread(
                submit, sub_images, xy, data.image_width, data.image_height, 
                data.scale_units, data.scale_lower, data.scale_upper
            )
            
            if not job_id:
                yield f"data: {json.dumps({'step': 'error', 'detail': detail})}\n\n"
                return
                
            yield f"data: {json.dumps({'step': 'submitted', 'job_id': job_id})}\n\n"
            
            client = get_http_client()
            while True:
                # 轮询状态
                try:
                    response = await client.get(f"http://nova.astrometry.net/api/jobs/{job_id}", timeout=10)
                    status_data = response.json()
                    status = status_data.get("status")
                except Exception as e:
                    yield f"data: {json.dumps({'step': 'error', 'detail': '查询任务状态失败'})}\n\n"
                    return
                    
                if status == "success":
                    yield f"data: {json.dumps({'step': 'solving'})}\n\n"
                    break
                elif status == "failure":
                    yield f"data: {json.dumps({'step': 'error', 'detail': '无法确定天体坐标'})}\n\n"
                    return
                else:
                    await asyncio.sleep(1)
            
            # 开始 recognize
            detail, hd_names = await recognize(
                job_id, xy, data.timestamp, radius=data.radius, max_mag=data.max_mag, is_zh=data.is_zh
            )
            
            if detail == "success":
                yield f"data: {json.dumps({'step': 'success', 'hd_names': hd_names})}\n\n"
            else:
                yield f"data: {json.dumps({'step': 'error', 'detail': detail})}\n\n"
                
        except asyncio.CancelledError:
            # 客户端断开连接
            pass
        except Exception as e:
            yield f"data: {json.dumps({'step': 'error', 'detail': '服务器内部发生未知错误'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
