import numpy as np
import astronomy as ast
from core.positioning.locator.utils.math import vector_angle
from core.positioning.calc import calc_geo as geo_calc
from core.astro_coord.calc import get_HaDecs_by_names
from core.positioning.locator.utils.math import sph2cart
from core.positioning.calc import stars_convert


def find_moon_idx(stars: list[dict]) -> int:
    """
    找到月亮的索引

    params:
        stars: star points
    return:
        返回月亮的索引
    """

    for i, star in enumerate(stars):
        if star["name"] in ["月", "月亮", "月球", "moon"]:
            return i
    return -1


def angle_btw_moon_stars(points: np.ndarray, moon_idx: int, z: float) -> np.ndarray:
    """
    计算月亮与星星的角距

    params:
        points: (n, 2), star points
        moon_idx: 月的索引
        z: 焦距
    return:
        返回角距列表
    """

    points_3d = np.concatenate([points, np.ones((len(points), 1)) * z], axis=1)
    target_angles = vector_angle(points_3d[moon_idx], points_3d)
    return target_angles


def geo_estimate_by_stars(
    data: dict,
    approx_timestamp: float,
    moon_idx: int,
    is_fix_gravity: bool,
    is_fix_refraction: bool,
) -> dict:
    """
    根据星星信息计算大致日期下的地理坐标

    params:
        data: a dict including:
            stars: (n, 2), star points
            lines: (n, 2, 2), plumb lines
        approx_timestamp: 大致时间戳
        moon_idx: 月的索引
        is_fix_gravity: 是否修正重力
        is_fix_refraction: 是否修正大气折射
    return:
        返回地理位置列表
    """

    # 数据转换
    _, _, star_names = stars_convert(data["stars"])
    # 根据大致日期获取各星时角赤纬
    approx_star_HaDecs, is_success = get_HaDecs_by_names(star_names, approx_timestamp)
    if not is_success:
        raise ValueError("无法获取天体坐标")
    for i, star_name in enumerate(star_names):
        data["stars"][i]["lon"] = np.deg2rad(
            360 - approx_star_HaDecs[star_name][0] * 15  # type: ignore
        )
        data["stars"][i]["lat"] = np.deg2rad(approx_star_HaDecs[star_name][1])  # type: ignore
    # 计算大致日期下的地理坐标
    data["stars"].pop(moon_idx)  # 剔除月的数据
    try:
        geo_estimate = geo_calc(
            data,
            is_fix_refraction=is_fix_refraction,
            is_fix_gravity=is_fix_gravity,
        )
    except:
        raise ValueError("无法计算地理位置")
    return geo_estimate


def s2sidereal_days(s: float) -> float:
    """
    将秒转换为恒星天

    params:
        s: number 秒
    return:
        number 恒星天
    """

    s_in_sidereal_day = 86164.0905
    return s / s_in_sidereal_day


def angle_error(
    timestamp: float,
    approx_timestamp: float,
    star_names: list[str],
    geo_estimate: dict,
    moon_idx: int,
    target_angles: np.ndarray,
):
    """
    误差函数，计算每一天的星星（含月）相互角距，输出误差

    params:
        timestamp: 时间戳
        approx_timestamp: 大致日期
        star_names: 星星名字列表
        geo_estimate: 地理坐标
        moon_idx: 月的索引
        target_angles: 目标角距
    return:
        number 返回星角距误差和
    """

    # 使用恒星日周期快速计算该时间下观测者地理坐标
    observer_lon = (
        np.rad2deg(geo_estimate["lon"])
        - s2sidereal_days(timestamp - approx_timestamp) * 360
    )
    observer_lon = wrap_angle_in_deg(observer_lon)
    # 得到该时间所计算的观测者地理坐标
    observer = ast.Observer(np.rad2deg(geo_estimate["lat"]), observer_lon, 0)
    # 获取该时间、该地理坐标下的天体时角赤纬
    star_HaDecs, _ = get_HaDecs_by_names(star_names, timestamp, observer)
    moon_HaDec = star_HaDecs[star_names[moon_idx]]
    assert moon_HaDec[0] and moon_HaDec[1]
    moon_vec = np.array(
        sph2cart(np.deg2rad(moon_HaDec[0] * 15), np.deg2rad(moon_HaDec[1]))
    )
    # 计算每颗星星（不包含月）与月的角距误差
    error = 0
    for i, star_name in enumerate(star_names):
        if i == moon_idx:
            continue
        star_HaDec = star_HaDecs[star_name]
        assert star_HaDec[0] and star_HaDec[1]
        star_vec = np.array(
            sph2cart(np.deg2rad(star_HaDec[0] * 15), np.deg2rad(star_HaDec[1]))
        )
        angle = vector_angle(star_vec, moon_vec)
        error += (np.rad2deg(angle - target_angles[i])) ** 2
    return error


def wrap_angle_in_deg(deg):
    """
    Make the angle in [-180, 180].
    """
    while deg > 180:
        deg -= 360
    while deg < -180:
        deg += 360
    return deg
