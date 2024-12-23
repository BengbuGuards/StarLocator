from pydantic import BaseModel, Field
from config import MAX_NUM_OF_STARS


class AstroTime(BaseModel):
    starNames: list[str] = Field(..., title="Star Names", max_length=MAX_NUM_OF_STARS)
    timestamp: float = Field(..., title="Timestamp", gt=0)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "starNames": [
                        "北落师门",
                        "火鸟六",
                        "土司空",
                        "室宿一",
                        "危宿三",
                        "月球",
                    ],
                    "timestamp": 1728921600,
                }
            ]
        }
    }


class AstroCoord(BaseModel):
    detail: str
    haDecs: dict[str, list[float | None]]
