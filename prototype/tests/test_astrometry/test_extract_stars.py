import io
import httpx
import pytest
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
from core.astrometry.extract import extract_stars
from config import BACKEND_API_BASEURL


def sort_positions(positions: list[list[float]]) -> list:
    positions_array = np.array(positions)
    center = np.array(image.size) / 2
    distances = np.linalg.norm(positions_array - center, axis=1)
    return positions_array[np.argsort(distances)].tolist()


def plot(image: Image.Image, objects: list[list[float]]):
    data_image = np.array(image.convert("L"), dtype=np.float64)
    # plot background-subtracted image
    fig, ax = plt.subplots()
    m, s = np.mean(data_image), np.std(data_image)
    im = ax.imshow(
        data_image,
        interpolation="nearest",
        cmap="gray",
        vmin=float(m - s),
        vmax=float(m + s),
        origin="lower",
    )

    # plot an ellipse for each object
    for i in range(len(objects)):
        e = Circle(xy=(objects[i][0], objects[i][1]), radius=10)
        e.set_facecolor("none")
        e.set_edgecolor("red")
        ax.add_artist(e)

    plt.show()


image = Image.open("../examples/picMemeRider1.jpeg").crop((0, 0, 3024, 2000))
target_positions = [
    [477.32, 268.11],
    [2925.06, 351.4],
    [2880.87, 446.34],
    [2479.18, 509.05],
    [1652.67, 510.68],
    [2932.68, 548.29],
    [2345.36, 607.36],
    [1847.01, 642.52],
    [1763.0, 659.0],
    [2584.52, 660.33],
    [34.27, 700.39],
    [1621.46, 781.51],
    [2547.16, 810.44],
    [2022.82, 924.79],
    [2655.53, 1046.25],
    [1659.0, 1108.51],
    [510.52, 1129.51],
    [2114.06, 1159.66],
    [2383.23, 1171.87],
    [2553.0, 1194.5],
    [1465.91, 1202.07],
    [1292.96, 1203.98],
    [2939.76, 1221.86],
    [1982.33, 1250.44],
    [2465.78, 1332.44],
    [1480.0, 1357.0],
    [2348.42, 1367.15],
    [2398.39, 1374.78],
    [1257.75, 1412.04],
    [2095.88, 1517.86],
    [1801.81, 1559.6],
    [1968.56, 1563.68],
    [431.49, 1579.5],
    [1799.22, 1587.16],
    [2493.96, 1592.52],
    [1299.66, 1644.35],
    [1856.59, 1641.79],
    [671.12, 1684.6],
    [1640.71, 1687.26],
    [1874.69, 1704.99],
    [1271.98, 1718.54],
    [1955.41, 1740.37],
    [914.12, 1744.05],
    [961.41, 1749.1],
    [1943.06, 1770.6],
    [2711.99, 1808.5],
    [2354.51, 1836.43],
    [2692.16, 1874.1],
    [136.53, 1873.54],
    [2635.47, 1926.15],
    [1607.75, 1929.96],
    [912.85, 1947.87],
    [1068.22, 1965.12],
    [732.11, 1981.45],
    [1109.36, 1997.87],
]
target_positions = sort_positions(target_positions)


def test_local():
    detail, positions = extract_stars(image, thresh=40)
    assert detail == "success" and type(positions) == list
    positions = sort_positions(positions)
    # plot(image, positions)  ##DEBUG
    for i in range(len(positions)):
        assert positions[i] == pytest.approx(target_positions[i], rel=1e-4)


def test_remote():
    byte_io = io.BytesIO()
    image.save(byte_io, format="JPEG")
    image_bytes = byte_io.getvalue()
    files = {"image": image_bytes}
    data = {
        "thresh": 40,
        "min_area": 1,
        "clean": True,
        "clean_param": 1.0,
    }
    response = httpx.post(
        f"{BACKEND_API_BASEURL}/astrometry/extractstars", files=files, data=data
    )
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["detail"] == "success", result
    positions = sort_positions(result["positions"])
    for i in range(len(positions)):
        assert positions[i] == pytest.approx(target_positions[i], rel=1e-4)
