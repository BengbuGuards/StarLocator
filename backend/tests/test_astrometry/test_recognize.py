import httpx
import pytest
from datetime import datetime
from config import BACKEND_API_BASEURL
from core.astrometry.solve import recognize

job_id = "12339064"
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
timestamp = datetime(2024, 10, 2, 8, 19, 30).timestamp()

target = [
    (1.9897989688757498, 28.218636151755415, "室宿二"),
    (1.9339721182415666, 25.604551898466813, "室宿增二"),
    (1.70823521216926, 23.878248190766683, "离宫五"),
    (1.6291023123906356, 23.54245362285061, "离宫六"),
    (2.2739194940482825, 12.305428191189998, "雷电二"),
    (1.0888809644149937, 25.281360500973765, "壁宿增六"),
    (0.9114997311323787, 29.230284316654693, "壁宿二"),
    (0.4358077885733779, 33.85739442331256, "奎宿六"),
    (0.3950906583243974, 30.998840521801952, "奎宿五"),
    (0.40801422894736816, 29.449717835792292, "奎宿四"),
    (23.887293691166132, 35.7539066873888, "奎宿九"),
    (0.10377900448763411, 38.63477453402231, "奎宿八"),
    (23.16431636047376, 29.702173420712025, "娄宿增六"),
]


def test_local():
    detail, hd_names = recognize(
        job_id,
        xy,
        timestamp,
        radius=60,
        max_mag=6,
        is_zh=True,
    )
    assert detail == "success"
    assert hd_names
    for i in range(len(hd_names)):
        assert hd_names[i][2] == target[i][2]
        assert hd_names[i][:2] == pytest.approx(target[i][:2])


def test_remote():
    data = {
        "job_id": job_id,
        "xy": xy,
        "timestamp": timestamp,
        "radius": 60,
        "max_mag": 6,
        "is_zh": True,
    }
    response = httpx.post(f"{BACKEND_API_BASEURL}/astrometry/recognize", json=data)
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["detail"] == "success"
    hd_names = result["hd_names"]
    for i in range(len(hd_names)):
        assert hd_names[i][2] == target[i][2]
        assert hd_names[i][:2] == pytest.approx(target[i][:2])
