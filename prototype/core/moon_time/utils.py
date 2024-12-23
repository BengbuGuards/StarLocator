from datetime import datetime
import numpy as np
import astronomy as ast
from core.positioning.locator.utils.math import vector_angle
from core.positioning.calc import calc_geo as geo_calc
from core.astro_coord.calc import get_HaDecs_by_names
from core.positioning.locator.utils.math import sph2cart, rad2deg, deg2rad
from core.positioning.calc import stars_convert


def find_moon_idx(stars):
    """
    找到月亮的索引

    params:
        stars: list, star points
    return:
        number 返回月亮的索引
    """

    for i, star in enumerate(stars):
        if star["name"] in ["月", "月亮", "月球", "moon"]:
            return i
    return -1


def angle_btw_moon_stars(points, moon_idx, z):
    """
    计算月亮与星星的角距

    params:
        points: (n, 2), star points
        moon_idx: int 月的索引
        z: number 焦距
    return:
        list 返回角距列表
    """

    points_3d = np.concatenate([points, np.ones((len(points), 1)) * z], axis=1)
    target_angles = vector_angle(points_3d[moon_idx], points_3d)
    return target_angles


def geo_estimate_by_stars(
    data, approx_timestamp, moon_idx, is_fix_gravity, is_fix_refraction
):
    """
    根据星星信息计算大致日期下的地理坐标

    params:
        data: a dict including:
            stars: (n, 2), star points
            lines: (n, 2, 2), plumb lines
        approx_timestamp: number 大致时间戳
        moon_idx: int 月的索引
        is_fix_gravity: boolean 是否修正重力
        is_fix_refraction: boolean 是否修正大气折射
    return:
        list 返回地理位置列表
    """

    # 数据转换
    _, _, star_names = stars_convert(data["stars"])
    # 根据大致日期获取各星时角赤纬
    approx_star_HaDecs, is_success = get_HaDecs_by_names(star_names, approx_timestamp)
    if not is_success:
        raise ValueError("无法获取天体坐标")
    for i, star_name in enumerate(star_names):
        data["stars"][i]["lon"] = deg2rad(360 - approx_star_HaDecs[star_name][0] * 15)
        data["stars"][i]["lat"] = deg2rad(approx_star_HaDecs[star_name][1])
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


def s2sidereal_days(s):
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
    timestamp, approx_timestamp, star_names, geo_estimate, moon_idx, target_angles
):
    """
    误差函数，计算每一天的星星（含月）相互角距，输出误差

    params:
        timestamp: number 时间戳
        approx_timestamp: number 大致日期
        star_names: list 星星名字列表
        geo_estimate: dict 地理坐标
        moon_idx: number 月的索引
        target_angles: list 目标角距
    return:
        number 返回星角距误差和
    """

    # 使用恒星日周期快速计算该时间下观测者地理坐标
    observer_lon = (
        rad2deg(geo_estimate["lon"])
        - s2sidereal_days(timestamp - approx_timestamp) * 360
    )
    observer_lon = wrap_angle_in_deg(observer_lon)
    # 得到该时间所计算的观测者地理坐标
    observer = ast.Observer(rad2deg(geo_estimate["lat"]), observer_lon, 0)
    # 获取该时间、该地理坐标下的天体时角赤纬
    star_HaDecs, _ = get_HaDecs_by_names(star_names, timestamp, observer)
    moon_HaDec = star_HaDecs[star_names[moon_idx]]
    moon_vec = np.array(sph2cart(deg2rad(moon_HaDec[0] * 15), deg2rad(moon_HaDec[1])))
    # 计算每颗星星（不包含月）与月的角距误差
    error = 0
    for i, star_name in enumerate(star_names):
        if i == moon_idx:
            continue
        star_HaDec = star_HaDecs[star_name]
        star_vec = np.array(
            sph2cart(deg2rad(star_HaDec[0] * 15), deg2rad(star_HaDec[1]))
        )
        angle = vector_angle(star_vec, moon_vec)
        error += (rad2deg(angle - target_angles[i])) ** 2
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
