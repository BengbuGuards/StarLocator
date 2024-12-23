from pydantic import BaseModel, Field
from config import MAX_NUM_OF_STARS


class AstroTime(BaseModel):
    starNames: list[str] = Field(..., title="Star Names", max_length=MAX_NUM_OF_STARS)
    timestamp: float = Field(..., title="Timestamp", gt=0)


class AstroCoord(BaseModel):
    detail: str
    haDecs: dict[str, list[float | None]]
