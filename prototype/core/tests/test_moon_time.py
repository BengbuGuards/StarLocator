import pytest
import datetime
from core.moonTime.calc import calc


def test_moon_time():
    data = {
        "stars": [
            {
                "x": -456,
                "y": 226,
                "name": "北落师门",
                "lat": -0.514698517559122,
                "lon": 1.4148802469500708
            },
            {
                "x": -1771,
                "y": 226,
                "name": "火鸟六",
                "lat": -0.7359784771918016,
                "lon": 1.8010525244668565
            },
            {
                "x": -1190,
                "y": -1129,
                "name": "土司空",
                "lat": -0.3115297329153774,
                "lon": 1.8766165544319517
            },
            {
                "x": 1240,
                "y": -1817,
                "name": "室宿一",
                "lat": 0.26775668134988717,
                "lon": 1.4453427873820661
            },
            {
                "x": 1879,
                "y": -685,
                "name": "危宿三",
                "lat": 0.17437230642688134,
                "lon": 1.0936691241925116
            },
            {
                "x": 287,
                "y": -528,
                "name": "月",
                "lat": -0.15740097203546588,
                "lon": 1.4272146342180179
            }
        ],
        "lines": [[[0.0, 0.0], [0.0, 1.0]], [[0.0, -5196.15], [1.0, -5196.15]]]
    }
    isFixRefraction = False
    isFixGravity = False

    approxTimestamp = datetime.datetime(2024, 10, 1, 0).timestamp()
    scopeDays = 30

    realTimestamp = calc(
        data, approxTimestamp, scopeDays, isFixRefraction, isFixGravity
    )

    target = datetime.datetime(
        2024, 10, 14, 16, tzinfo=datetime.timezone.utc
    ).timestamp()

    assert realTimestamp == pytest.approx(target)
