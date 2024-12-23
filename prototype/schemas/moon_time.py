from pydantic import BaseModel, Field
from .base import PointLines, Stars
from config import MAX_NUM_OF_STARS, MAX_MOON_SEARCH_RANGE


class MoonPointLines(PointLines):
    # 对于标月定时，星体数量至少为4
    stars: list[Stars] = Field(
        ..., title="List of stars", min_length=4, max_length=MAX_NUM_OF_STARS
    )


class MoonTimeRequest(BaseModel):
    photo: MoonPointLines
    approxTimestamp: float = Field(..., title="Approximate timestamp", gt=0)
    scopeDays: float = Field(..., title="Scope days", gt=0, le=MAX_MOON_SEARCH_RANGE)
    isFixRefraction: bool = False
    isFixGravity: bool = False

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "photo": {
                        "stars": [
                            {
                                "x": -456,
                                "y": 226,
                                "name": "北落师门",
                                "lat": -0.514698517559122,
                                "lon": 1.4148802469500708,
                            },
                            {
                                "x": -1771,
                                "y": 226,
                                "name": "火鸟六",
                                "lat": -0.7359784771918016,
                                "lon": 1.8010525244668565,
                            },
                            {
                                "x": -1190,
                                "y": -1129,
                                "name": "土司空",
                                "lat": -0.3115297329153774,
                                "lon": 1.8766165544319517,
                            },
                            {
                                "x": 1240,
                                "y": -1817,
                                "name": "室宿一",
                                "lat": 0.26775668134988717,
                                "lon": 1.4453427873820661,
                            },
                            {
                                "x": 1879,
                                "y": -685,
                                "name": "危宿三",
                                "lat": 0.17437230642688134,
                                "lon": 1.0936691241925116,
                            },
                            {
                                "x": 287,
                                "y": -528,
                                "name": "月",
                                "lat": -0.15740097203546588,
                                "lon": 1.4272146342180179,
                            },
                        ],
                        "lines": [
                            [[0.0, 0.0], [0.0, 1.0]],
                            [[0.0, -5196.15], [1.0, -5196.15]],
                        ],
                    },
                    "approxTimestamp": 1727712000,
                    "scopeDays": 365,
                    "isFixRefraction": False,
                    "isFixGravity": False,
                }
            ]
        }
    }


class MoonTimeResponse(BaseModel):
    detail: str
    time: float | None
