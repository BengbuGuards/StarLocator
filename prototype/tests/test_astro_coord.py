import time
import httpx
import pytest
import datetime
from config import BACKEND_API_BASEURL
from core.astro_coord.calc import get_HaDecs_by_names


star_names = ["北落师门", "火鸟六", "土司空", "室宿一", "危宿三", "月球"]

timestamp = datetime.datetime(
    2024, 10, 14, 16, tzinfo=datetime.timezone.utc
).timestamp()  # 1728921600

target = {
    "北落师门": [18.595556930406165, -29.49005348878152],
    "火鸟六": [17.12048758918283, -42.168460801822654],
    "土司空": [16.831855171272608, -17.849340559226274],
    "室宿一": [18.479197486611962, 15.34132894683517],
    "危宿三": [19.822494325758775, 9.99079838431698],
    "月球": [18.548443184393808, -9.018411404642423],
}


def test_local():
    result, is_success = get_HaDecs_by_names(star_names, timestamp)
    assert is_success
    for star_name in star_names:
        assert result[star_name] == pytest.approx(target[star_name])

    # 验证缓存功能
    start_time = time.time()
    result, is_success = get_HaDecs_by_names(star_names, timestamp)
    end_time = time.time()
    assert is_success
    for star_name in star_names:
        assert result[star_name] == pytest.approx(target[star_name])
    assert end_time - start_time < 0.05


def test_remote():
    url = f"{BACKEND_API_BASEURL}/astrocoord"
    data = {"starNames": star_names, "timestamp": timestamp}
    resp = httpx.post(url, json=data)
    assert resp.status_code == 200
    result = resp.json()
    assert result["detail"] == "success"
    for star_name in star_names:
        assert result["haDecs"][star_name] == pytest.approx(target[star_name])

    # 验证缓存功能
    start_time = time.time()
    resp = httpx.post(url, json=data)
    end_time = time.time()
    assert resp.status_code == 200
    result = resp.json()
    assert result["detail"] == "success"
    for star_name in star_names:
        assert result["haDecs"][star_name] == pytest.approx(target[star_name])
    assert end_time - start_time < 0.05
