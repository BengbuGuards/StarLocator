from pydantic import BaseModel
from .base import PointLines


class LocatorRequest(BaseModel):
    data: PointLines
    isFixRefraction: bool = False
    isFixGravity: bool = False


class Position(BaseModel):
    detail: str
    lat: float
    lon: float
