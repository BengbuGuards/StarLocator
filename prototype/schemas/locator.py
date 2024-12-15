from pydantic import BaseModel
from schemas.stars import Stars
from typing import List

Coordinate = List[float]


class PointLines(BaseModel):
    stars: List[Stars]
    lines: List[List[Coordinate]]


class Position(BaseModel):
    lat: float
    lon: float
