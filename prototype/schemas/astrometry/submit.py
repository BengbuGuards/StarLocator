from fastapi import UploadFile
from ..base import Coordinate
from pydantic import BaseModel, Field
from config import MAX_NUM_OF_STARS


class SubmitRequest(BaseModel):
    sub_images: list[UploadFile] = Field(
        ...,
        description="The images around stars.",
        min_length=3,
        max_length=MAX_NUM_OF_STARS,
    )
    xy: str = Field(
        ...,
        description="The positions of the stars in the image.",
        min_length=1,
    )
    image_width: int = Field(..., description="The width of the original image.", ge=1)
    image_height: int = Field(
        ..., description="The height of the original image.", ge=1
    )
    scale_units: str = Field(
        "degwidth",
        description="The units of the scale width.",
        pattern="^degwidth|arcminwidth|arcsecperpix$",
    )
    scale_lower: float = Field(
        10, description="The lower bound of the scale width.", ge=0.1, le=180
    )
    scale_upper: float = Field(
        180, description="The upper bound of the scale width.", ge=0.1, le=180
    )


class SubmitResponse(BaseModel):
    detail: str = Field(..., description="Whether the extraction is successful.")
    job_id: str | None = Field(..., description="The job id of the submission.")
