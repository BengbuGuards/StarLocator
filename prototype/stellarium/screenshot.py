import os
import re
from datetime import datetime, timezone

import requests

HOST = "http://127.0.0.1"
PORT = 8090

BASE_URL = "{}:{}".format(HOST, PORT)


def execute_code(code):
    url = "{}/api/scripts/direct".format(BASE_URL)
    data = {"code": code}
    resp = requests.post(url, data=data)
    res = resp.text
    return res


def screenshot(name, folder="./"):
    path = os.path.abspath(folder)
    SCRIPT_SCREEN_SHOT = (
        'core.wait(0.5);core.screenshot("{}",false,"{}",true,"png");'.format(name, path)
    )
    execute_code(SCRIPT_SCREEN_SHOT)


def set_location(lat, lng, alt):
    COMMAND_SCRIPT = "core.setObserverLocation({},{},{},0);".format(lng, lat, alt)
    res = execute_code(COMMAND_SCRIPT)
    print("设置经纬度 lat/lng/alt {}/{}/{} : {}".format(lat, lng, alt, res))


def set_time(dt: datetime):
    utc_time = dt.astimezone(timezone.utc)
    utc_time_str = utc_time.strftime("%Y-%m-%dT%H:%M:%S")
    COMMAND_SCRIPT = 'core.setTimeRate(0);\ncore.setDate("{}", "utc", false);'.format(
        utc_time_str
    )

    res = execute_code(COMMAND_SCRIPT)

    print("设置时间 {} : {}".format(dt, res))


def set_direction(azimuth_from_south, altitude):
    COMMAND_SCRIPT = "core.moveToAltAzi({},{},0);".format(altitude, azimuth_from_south)

    res = execute_code(COMMAND_SCRIPT)

    print("设置 方位角 {} 高度角 {} : {}".format(azimuth_from_south, altitude, res))


def set_fov(fov_degree):
    COMMAND_SCRIPT = "StelMovementMgr.zoomTo({}, 0)".format(fov_degree)

    res = execute_code(COMMAND_SCRIPT)

    print("设置 FOV {} : {}".format(fov_degree, res))


def sanitize_filename(input_str):
    sanitized_str = re.sub(r'[<>:"/\\|?*]', "_", input_str)
    sanitized_str = sanitized_str.strip()
    return sanitized_str


def make_screenshot():
    dt = datetime.fromisoformat("2024-10-31T18:00:00+08:00")
    set_time(dt)

    observer_latitude = 40
    observer_longtitude = 116
    observer_altitude = 0
    azimuth_degree_from_south = 0
    altitude_degree = 30
    fov_degree = 75.7

    set_location(observer_latitude, observer_longtitude, observer_altitude)
    set_direction(azimuth_degree_from_south, altitude_degree)
    set_fov(fov_degree)

    COMMAND_SCRIPT = """
    core.setProjectionMode("ProjectionPerspective");
    core.setDiskViewport(false);
    core.setSkyCulture("modern_iau");
    AsterismMgr.setFlagLines(true);
    AsterismMgr.setFlagLabels(true);
    ConstellationMgr.setFlagArt(false);
    GridLinesMgr.setFlagGridlines(true);
    GridLinesMgr.setFlagAzimuthalGrid(true);
    LandscapeMgr.setCurrentLandscapeID("zero");
    LandscapeMgr.setFlagOrdinalPoints(true);
    LandscapeMgr.setFlagAtmosphere(false);
    StelSkyLayerMgr.setFlagShow(false);
    StelSkyDrawer.setFlagHasAtmosphere(false);
    ZodiacalLight.setFlagShow(false);
    """
    execute_code(COMMAND_SCRIPT)

    fn = "stellarium_{}_{}_{}".format(
        dt.isoformat(), observer_latitude, observer_longtitude
    )
    fn = sanitize_filename(fn)

    screenshot(fn, folder="./")


make_screenshot()
