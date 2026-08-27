from pydantic import BaseModel, Field

from config import MAX_NUM_OF_LINES, MAX_NUM_OF_STARS

Coordinate = tuple[float, float]
Line = tuple[Coordinate, Coordinate]


class Stars(BaseModel):
    name: str = Field(..., title="Star name", min_length=1)
    x: float
    y: float
    lat: float
    lon: float


class PointLines(BaseModel):
    stars: list[Stars] = Field(
        ..., title="List of stars", min_length=3, max_length=MAX_NUM_OF_STARS
    )
    lines: list[Line] = Field(
        default_factory=list,
        title="List of plumb lines",
        max_length=MAX_NUM_OF_LINES,
    )
    horizon: list[Line] = Field(
        default_factory=list,
        title="List of horizon line segments",
        max_length=MAX_NUM_OF_LINES,
    )
