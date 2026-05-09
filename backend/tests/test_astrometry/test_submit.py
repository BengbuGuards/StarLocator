import pytest
from PIL import Image
from core.astrometry.solve import flux_in_img, submit


def crop_image(image: Image.Image, x: float, y: float, size: float) -> Image.Image:
    return image.crop((x - size, y - size, x + size, y + size))


xy = [
    (650.8, 33.41),
    (703.14, 79.09),
    (709.57, 170.07),
    (705.1, 198.62),
    (1114.71, 75.48),
    (587.4, 340.17),
    (477.09, 342.3),
    (301.54, 408.02),
    (355.75, 457.07),
    (390.5, 473.86),
    (159.43, 518.48),
    (137.21, 422.11),
    (125.23, 800.0),
]

target_fluxs = [
    519.08,
    67.4,
    107.01,
    84.96,
    393.89,
    86.01,
    391.27,
    76.34,
    185.0,
    53.62,
    316.34,
    133.95,
    126.21,
]

image = Image.open("../examples/picLightDog.jpeg")
cropped_images = [crop_image(image, x, y, 10) for x, y in xy]


def test_flux_in_img():
    fluxs = flux_in_img(cropped_images)
    assert fluxs == pytest.approx(target_fluxs, rel=1e-2)


# submit仅用来提交任务，求解部分交由在线Astrometry，因此不做测试
def log_submit():
    detail, job_id = submit(cropped_images, xy, *image.size)
    print(detail, job_id)
