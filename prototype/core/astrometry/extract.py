import numpy as np
from PIL import Image
import sep_pjw as sep


def extract_stars(
    image: Image.Image,
    thresh: float = 30,
    min_area: int = 1,
    clean: bool = True,
    clean_param: float = 1.0,
) -> tuple[str, list | None]:
    """
    Extract stars from an image.

    Args:
        image (PIL.Image): The image to extract stars from.
        thresh (float): The threshold for star detection.
        min_area (int): The minimum area for star detection.
        clean (bool): Whether to clean the image.
        clean_param (float): The cleaning

    Returns:
        detail: Whether the extraction is successful.
        positions: The positions of the stars in the image.
    """
    detail = "success"
    # 转换为灰度图像
    image = image.convert("L")
    # 转换为numpy数组
    image_array = np.array(image, dtype=np.float64)
    # 背景提取
    bkg = sep.Background(image_array)
    image_sub = image_array - bkg
    # 检测星星
    try:
        objects = sep.extract(
            image_sub,
            thresh,
            minarea=min_area,
            clean=clean,
            clean_param=clean_param,
        )
    except Exception as e:
        return str(e), None
    # 提取星星位置
    positions = np.around(
        np.array([objects["x"], objects["y"]]),
        decimals=2,
    ).T.tolist()
    assert type(positions) == list
    return detail, positions
