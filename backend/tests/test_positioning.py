import httpx
import pytest
import numpy as np
from config import BACKEND_API_BASEURL
from core.positioning.calc import calc_geo


photo = {
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
    "lines": [[[0.0, 0.0], [0.0, 1.0]], [[0.0, -17013.85], [1.0, -17013.85]]],
}
is_fix_refraction = True
is_fix_gravity = True

target = {
    "detail": "success",
    "z": 3000,
    "lon": 115,
    "lat": 34.999625,
}
target_topPoint = [0.0, -17013.85]


def assert_geojson(geojson):
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 2

    point = geojson["features"][0]
    error_line = geojson["features"][1]

    assert point["type"] == "Feature"
    assert point["geometry"]["type"] == "Point"
    point_coords = point["geometry"]["coordinates"]
    assert point_coords == pytest.approx([target["lon"], target["lat"]], rel=6e-3)
    assert point["properties"]["kind"] == "position"
    assert point["properties"]["topPoint"] == pytest.approx(target_topPoint)

    assert error_line["type"] == "Feature"
    assert error_line["geometry"]["type"] == "LineString"
    assert np.array(error_line["geometry"]["coordinates"]) == pytest.approx(
        np.array(
            [
                [point_coords[0] - 0.125, point_coords[1]],
                [point_coords[0] + 0.125, point_coords[1]],
            ]
        ),
        rel=6e-3,
    )
    assert error_line["properties"] == {"kind": "error-line", "shiftDeg": 0.125}


def test_local():
    geo = calc_geo(photo, is_fix_refraction, is_fix_gravity)
    geo["lat"] = np.rad2deg(geo["lat"])
    geo["lon"] = np.rad2deg(geo["lon"])
    assert geo["topPoint"] == pytest.approx(target_topPoint)
    assert_geojson(geo["geojson"])
    del geo["topPoint"]
    del geo["geojson"]
    assert geo == pytest.approx(target, rel=6e-3)


def test_remote():
    url = f"{BACKEND_API_BASEURL}/positioning"
    post_data = {
        "photo": photo,
        "isFixRefraction": is_fix_refraction,
        "isFixGravity": is_fix_gravity,
    }
    resp = httpx.post(url, json=post_data)
    assert resp.status_code == 200
    result = resp.json()
    result["lat"] = np.rad2deg(result["lat"])
    result["lon"] = np.rad2deg(result["lon"])
    assert result["topPoint"] == pytest.approx(target_topPoint)
    assert_geojson(result["geojson"])
    del result["topPoint"]
    del result["geojson"]
    assert result == pytest.approx(target, rel=6e-3)
