from datetime import datetime
import numpy as np
import astronomy as ast
from ..positioning.findZ.utils.math import vector_angle
from ..positioning.calc import calc_geo as geo_calc
from ..astroCoord.calc import get_HaDec_by_names
from ..positioning.locator.utils.math import sph2cart, rad2deg, deg2rad
from ..positioning.calc import stars_convert


def findMoonIndex(stars):
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


def AngleBetweenMoonAndStar(points, moonIndex, z):
    """
    计算月亮与星星的角距

    params:
        points: (n, 2), star points
        z: number 焦距
    return:
        list 返回角距列表
    """

    points_3d = np.concatenate([points, np.ones((len(points), 1)) * z], axis=1)
    targetAngles = vector_angle(points_3d[moonIndex], points_3d)
    return targetAngles


def geoEstimatebyStars(data, approxTimestamp, moonIndex, isFixGravity, isFixRefraction):
    """
    根据星星信息计算大致日期下的地理坐标

    params:
        data: a dict including:
            stars: (n, 2), star points
            lines: (n, 2, 2), plumb lines
        approxTimestamp: number 大致时间戳
        moonIndex: int 月的索引
        isFixGravity: boolean 是否修正重力
        isFixRefraction: boolean 是否修正大气折射
    return:
        list 返回地理位置列表
    """

    # 数据转换
    _, _, star_names = stars_convert(data["stars"])
    # 根据大致日期获取各星时角赤纬
    approxStarHaDecs = get_HaDec_by_names(star_names, approxTimestamp)
    for i, star_name in enumerate(star_names):
        data["stars"][i]["lon"] = deg2rad(360 - approxStarHaDecs[star_name][0] * 15)
        data["stars"][i]["lat"] = deg2rad(approxStarHaDecs[star_name][1])
    # 计算大致日期下的地理坐标
    data["stars"].pop(moonIndex)  # 剔除月的数据
    geoEstimate = geo_calc(
        data,
        isFixRefraction=isFixRefraction,
        isFixGravity=isFixGravity,
    )
    return geoEstimate


def sToSiderealDays(s):
    """
    将秒转换为恒星天

    params:
        s: number 秒
    return:
        number 恒星天
    """

    msInSiderealDay = 86164.0905
    return s / msInSiderealDay


def angleError(
    timestamp, approxTimestamp, star_names, geoEstimate, moonIndex, targetAngles
):
    """
    误差函数，计算每一天的星星（含月）相互角距，输出误差

    params:
        timestamp: number 时间戳
        approxTimestamp: number 大致日期
        star_names: list 星星名字列表
        geoEstimate: dict 地理坐标
        moonIndex: number 月的索引
        targetAngles: list 目标角距
    return:
        number 返回星角距误差和
    """

    # 使用恒星日周期快速计算该时间下观测者地理坐标
    observerLon = (
        rad2deg(geoEstimate["lon"]) - sToSiderealDays(timestamp - approxTimestamp) * 360
    )
    observerLon = wrap_angle_in_deg(observerLon)
    # 得到该时间所计算的观测者地理坐标
    observer = ast.Observer(rad2deg(geoEstimate["lat"]), observerLon, 0)
    # 获取该时间、该地理坐标下的天体时角赤纬
    starHaDecs = get_HaDec_by_names(star_names, timestamp, observer)
    moonHaDec = starHaDecs[star_names[moonIndex]]
    moonVec = np.array(sph2cart(deg2rad(moonHaDec[0] * 15), deg2rad(moonHaDec[1])))
    # 计算每颗星星（不包含月）与月的角距误差
    error = 0
    for i, star_name in enumerate(star_names):
        if i == moonIndex:
            continue
        starHaDec = starHaDecs[star_name]
        starVec = np.array(sph2cart(deg2rad(starHaDec[0] * 15), deg2rad(starHaDec[1])))
        angle = vector_angle(starVec, moonVec)
        error += (rad2deg(angle - targetAngles[i])) ** 2
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
