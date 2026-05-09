from ..base import Coordinate
from pydantic import BaseModel, Field
from config import MAX_NUM_OF_STARS


class RecognizeRequest(BaseModel):
    job_id: str = Field(..., description="The job id of the submission.", min_length=1)
    xy: list[Coordinate] = Field(
        ...,
        description="The list of x, y coordinates.",
        min_length=1,
        max_length=MAX_NUM_OF_STARS,
    )
    timestamp: float = Field(..., description="The timestamp of the image.", gt=0)
    radius: float = Field(60, description="The radius of the search area.", gt=0)
    max_mag: float = Field(6, description="The maximum magnitude of the stars.")
    is_zh: bool = Field(False, description="Whether to use the Chinese star names.")


class RecognizeResponse(BaseModel):
    detail: str = Field(..., description="Whether the extraction is successful.")
    hd_names: list[tuple[float, float, str]] | None = Field(
        ..., description="The list of RA, Dec, and star names."
    )
