import httpx
import numpy as np
import pytest

from config import BACKEND_API_BASEURL
from core.positioning.calc import calc_geo

# 以 test_positioning.py 中已验证的地面真值为基准构造地平线数据。
# 真值：天顶灭点 top_true=(0, -17013.85)，焦距 F_TRUE=3000。
# 天顶射线 n=(top_x, top_y, F)，图像平面上地平线满足 n·(x,y,F)=0。
F_TRUE = 3000.0
top_true = np.array([0.0, -17013.85])
n_true = np.array([*top_true, F_TRUE])
n_true = n_true / np.linalg.norm(n_true)

stars = [
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
]


def _horizon_y(x):
    # 地平线直线：n_x * x + n_y * y + n_z * F_TRUE = 0
    return (-n_true[2] * F_TRUE - n_true[0] * x) / n_true[1]


horizon = [
    [[x, _horizon_y(x)], [x + 500, _horizon_y(x + 500)]]
    for x in (-1500.0, -500.0, 500.0)
]

photo = {"stars": stars, "lines": [], "horizon": horizon}
is_fix_refraction = True
is_fix_gravity = True

target = {
    "detail": "success",
    "z": 2997.156,
    "lon": 114.948,
    "lat": 35.095,
}
target_topPoint = [0.0, -16969.32]


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


def test_local_missing_reference():
    # 既无铅垂线也无地平线时应返回明确的错误提示
    geo = calc_geo({"stars": stars, "lines": [], "horizon": []},
                   is_fix_refraction, is_fix_gravity)
    assert geo == {"detail": "请至少标注两条铅垂线或一条地平线"}


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
