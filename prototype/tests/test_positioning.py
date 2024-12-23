import httpx
import pytest
from config import BACKEND_API_BASEURL
from core.positioning.calc import calc_geo
from core.positioning.locator.utils.math import rad2deg


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
    "lon": 115,
    "lat": 34.999625,
}


def test_local():
    geo = calc_geo(photo, is_fix_refraction, is_fix_gravity)
    geo["lat"] = rad2deg(geo["lat"])
    geo["lon"] = rad2deg(geo["lon"])
    assert geo == pytest.approx(target, abs=2e-1)


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
    result["lat"] = rad2deg(result["lat"])
    result["lon"] = rad2deg(result["lon"])
    assert result == pytest.approx(target, abs=2e-1)
