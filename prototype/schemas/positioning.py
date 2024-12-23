from pydantic import BaseModel
from .base import PointLines


class LocatorRequest(BaseModel):
    photo: PointLines
    isFixRefraction: bool = False
    isFixGravity: bool = False

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "photo": {
                        "stars": [
                            {
                                "x": -1201.17,
                                "y": -1819.5,
                                "name": "虚宿二",
                                "lat": 0.09341147600777984,
                                "lon": 1.2108214413505443,
                            },
                            {
                                "x": -361.46,
                                "y": -1706.09,
                                "name": "瓠瓜二",
                                "lat": 0.2792875869041326,
                                "lon": 1.0830800661765572,
                            },
                            {
                                "x": 1124.82,
                                "y": -6691.48,
                                "name": "ο And",
                                "lat": 0.7410939499629344,
                                "lon": 1.6733736902577325,
                            },
                            {
                                "x": -629.95,
                                "y": -6035.47,
                                "name": "室宿二",
                                "lat": 0.49252561233494535,
                                "lon": 1.681714182420701,
                            },
                            {
                                "x": 663.58,
                                "y": -2323.9,
                                "name": "天津九",
                                "lat": 0.5945701655622426,
                                "lon": 1.0805747914794241,
                            },
                        ],
                        "lines": [
                            [[0.0, 0.0], [0.0, 1.0]],
                            [[0.0, -17013.85], [1.0, -17013.85]],
                        ],
                    },
                    "isFixRefraction": True,
                    "isFixGravity": True,
                }
            ]
        }
    }


class Position(BaseModel):
    detail: str
    lat: float
    lon: float
