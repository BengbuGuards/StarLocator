from fastapi import UploadFile
from ..base import Coordinate
from pydantic import BaseModel, Field


class ExtractStarRequest(BaseModel):
    image: UploadFile = Field(..., description="The image to extract stars from.")
    thresh: float = Field(30, description="The threshold for star detection.", ge=0)
    min_area: int = Field(1, description="The minimum area for star detection.", gt=0)
    clean: bool = Field(True, description="Whether to clean the image.")
    clean_param: float = Field(1.0, description="The cleaning", ge=0)


class ExtractStarResponse(BaseModel):
    detail: str = Field(..., description="Whether the extraction is successful.")
    positions: list[Coordinate] | None = Field(
        ..., description="The positions of the stars in the image."
    )
