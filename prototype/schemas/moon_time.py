from pydantic import BaseModel, Field
from .base import PointLines, Stars
from config import MAX_NUM_OF_STARS, MAX_MOON_SEARCH_RANGE


class MoonPointLines(PointLines):
    # 对于标月定时，星体数量至少为4
    stars: list[Stars] = Field(
        ..., title="List of stars", min_length=4, max_length=MAX_NUM_OF_STARS
    )


class MoonTimeRequest(BaseModel):
    data: MoonPointLines
    approxTimestamp: float = Field(..., title="Approximate timestamp", gt=0)
    scopeDays: float = Field(..., title="Scope days", gt=0, le=MAX_MOON_SEARCH_RANGE)
    isFixRefraction: bool = False
    isFixGravity: bool = False


class MoonTimeResponse(BaseModel):
    detail: str
    time: float | None
