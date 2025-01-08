from copy import deepcopy
import numpy as np
from .utils import (
    find_moon_idx,
    angle_btw_moon_stars,
    geo_estimate_by_stars,
    angle_error,
)
from core.positioning.calc import stars_convert, calc_z
from core.positioning.find_z.utils.math import minimize
from core.positioning.top_point.methods.matrix_inverse import intersection


def calc(
    photo: dict,
    approx_timestamp: float,
    scope_days: float,
    is_fix_gravity: bool = False,
    is_fix_refraction: bool = False,
) -> float:
    """
    根据星星（含月）相互角距计算对应时间

    params:
        photo: 数据，第一个是月亮:
            stars: list, star points
            lines: (n, 2, 2), plumb lines
        approx_timestamp: 大致时间戳
        scope_days: 日期搜索范围大小（单位天）
        is_fix_gravity: 是否修正重力
        is_fix_refraction: 是否修正大气折射
    return:
        float 返回对应时间戳
    """

    # 数据转换
    moon_idx = find_moon_idx(photo["stars"])
    if moon_idx == -1:
        raise ValueError("没有找到月亮数据")
    # 获取灭点、焦距
    points, hour_decs, _ = stars_convert(
        [photo["stars"][i] for i in range(len(photo["stars"])) if i != moon_idx]
    )  # 剔除月的数据
    try:
        top_point = intersection(np.array(photo["lines"]))
    except:
        raise ValueError("无法找到灭点")
    try:
        z = calc_z(points, hour_decs, top_point, is_fix_refraction)
    except:
        raise ValueError("无法计算焦距")
    # 获取月与各星相互角距作为目标值
    points, _, star_names = stars_convert(photo["stars"])
    target_angles = angle_btw_moon_stars(points, moon_idx, z)
    # 根据星星信息计算大致日期下的地理坐标
    geo_estimate = geo_estimate_by_stars(
        deepcopy(photo), approx_timestamp, moon_idx, is_fix_gravity, is_fix_refraction
    )

    s_per_day = 86400

    # 将scope_days划分为每20天一个区间，对每个区间使用三段二分法minimize搜索最小误差，最后返回最小误差对应的时间
    min_time = int(approx_timestamp - (scope_days * s_per_day) / 2)
    max_time = int(approx_timestamp + (scope_days * s_per_day) / 2)
    min_error = float("inf")
    opt_time = 0
    opt_func = lambda timestamp: angle_error(
        timestamp, approx_timestamp, star_names, geo_estimate, moon_idx, target_angles
    )
    for left_i in range(min_time, max_time, 20 * s_per_day):
        right_i = min(left_i + 20 * s_per_day, max_time)
        opt_time_single = minimize(opt_func, left_i, right_i, 1, 100)
        time_error = opt_func(opt_time_single)
        if time_error < min_error:
            min_error = time_error
            opt_time = opt_time_single

    return opt_time
