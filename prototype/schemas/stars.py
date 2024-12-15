from pydantic import BaseModel


class Stars(BaseModel):
    name: str
    x: float
    y: float
    lat: float
    lon: float
