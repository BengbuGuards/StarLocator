import numpy as np
from core.positioning.calc import stars_convert
from .utils import (
    findMoonIndex,
    AngleBetweenMoonAndStar,
    geoEstimatebyStars,
    angleError,
)
from ..positioning.calc import calc_z, calc_geo
from ..positioning.findZ.utils.math import minimize
from ..positioning.topPoint.methods.matrix_inverse import intersection


def calc(data, approxTimestamp, scopeDays, isFixGravity=False, isFixRefraction=False):
    """
    根据星星（含月）相互角距计算对应时间

    params:
        data: dict，数据，第一个是月亮:
            stars: list, star points
            lines: (n, 2, 2), plumb lines
        approxTimestamp: float 大致时间戳
        scopeDays: number 日期搜索范围大小（单位天）
        isFixGravity: boolean 是否修正重力
        isFixRefraction: boolean 是否修正大气折射
    return:
        float 返回对应时间戳
    """

    # 数据转换
    moonIndex = findMoonIndex(data["stars"])
    # 获取焦距
    points, hour_decs, _ = stars_convert(
        [data["stars"][i] for i in range(len(data["stars"])) if i != moonIndex]
    )  # 剔除月的数据
    top_point = intersection(np.array(data["lines"]))
    z = calc_z(points, hour_decs, top_point, isFixRefraction)
    # 获取月与各星相互角距作为目标值
    points, _, star_names = stars_convert(data["stars"])
    targetAngles = AngleBetweenMoonAndStar(points, moonIndex, z)
    # 根据星星信息计算大致日期下的地理坐标
    geoEstimate = geoEstimatebyStars(
        data, approxTimestamp, moonIndex, isFixGravity, isFixRefraction
    )

    sPerDay = 86400

    # 将scopeDate划分为每20天一个区间，对每个区间使用三段二分法minimize搜索最小误差，最后返回最小误差对应的时间
    minTime = int(approxTimestamp - (scopeDays * sPerDay) / 2)
    maxTime = int(approxTimestamp + (scopeDays * sPerDay) / 2)
    minError = float("inf")
    optTime = 0
    optFunc = lambda timestamp: angleError(
        timestamp, approxTimestamp, star_names, geoEstimate, moonIndex, targetAngles
    )
    for lefti in range(minTime, maxTime, 20 * sPerDay):
        righti = min(lefti + 20 * sPerDay, maxTime)
        optTimeSingle = minimize(optFunc, lefti, righti, 1e-6, 100)
        timeError = optFunc(optTimeSingle)
        if timeError < minError:
            minError = timeError
            optTime = optTimeSingle

    return optTime
