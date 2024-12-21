import time
import datetime
import pytest
from core.astroCoord.calc import get_HaDec_by_names


def test_get_HaDec_by_names():
    starNames = ["北落师门", "火鸟六", "土司空", "室宿一", "危宿三", "月球"]

    timestamp = datetime.datetime(
        2024, 10, 14, 16, tzinfo=datetime.timezone.utc
    ).timestamp()
    target = {
        "北落师门": [18.595556930406165, -29.49005348878152],
        "火鸟六": [17.12048758918283, -42.168460801822654],
        "土司空": [16.831855171272608, -17.849340559226274],
        "室宿一": [18.479197486611962, 15.34132894683517],
        "危宿三": [19.822494325758775, 9.99079838431698],
        "月球": [18.548443184393808, -9.018411404642423],
    }
    result = get_HaDec_by_names(starNames, timestamp)
    for starName in starNames:
        assert result[starName] == pytest.approx(target[starName])

    # 验证缓存功能
    start_time = time.time()
    result = get_HaDec_by_names(starNames, timestamp)
    end_time = time.time()
    for starName in starNames:
        assert result[starName] == pytest.approx(target[starName])
    assert end_time - start_time < 0.05
