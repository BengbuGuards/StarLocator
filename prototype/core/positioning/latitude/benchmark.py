from . import constants
import numpy as np
from matplotlib import pyplot as plt
from .method.bisect_formular import (
    astronomic_latitude_to_geodetic_latitude as bisect_formular,
)
from .method.bisect_tabular import (
    astronomic_latitude_to_geodetic_latitude as bisect_tabular,
)
from .method.naive import astronomic_latitude_to_geodetic_latitude as naive
from .method.series import astronomic_latitude_to_geodetic_latitude as series
from .method.series2 import astronomic_latitude_to_geodetic_latitude as series2

geodetic_latitudes = np.linspace(-90, 90, 10001)


def get_geocentric_latitude(geodetic_latitude_in_rad):
    tan_theta = (1 - constants.f) ** 2 * np.tan(geodetic_latitude_in_rad)
    return np.arctan(tan_theta)


def get_astronomic_latitude(geocentric_latitude_in_rad):
    ## 地心纬度的自转半径
    centripetal_radius_at_geocentric_latitude = constants.a * np.cos(
        geocentric_latitude_in_rad
    )

    ## 自转向心力加速度
    centripetal_acc_at_geocentric_latitude = (
        constants.OMEGA**2 * centripetal_radius_at_geocentric_latitude
    )

    ## 地心纬度的半径的平方
    squared_geocentric_radius_at_geocentric_latitude = (
        constants.a**2 * np.cos(geocentric_latitude_in_rad) ** 2
        + constants.b**2 * np.sin(geocentric_latitude_in_rad) ** 2
    )

    ## 两极的万有引力的加速度，没有自转加速度
    # g_p = G * M_earth / b ** 2
    ## 地心纬度的万有引力的加速度
    # g = G * M_earth / R ** 2
    ## 所以地心纬度的万有引力的加速度
    ## g = g_p * b ** 2 / R ** 2
    g_at_geocentric_latitude = (
        constants.g_p
        * constants.b**2
        / squared_geocentric_radius_at_geocentric_latitude
    )

    ## 使用直角坐标系的向量来记录万有引力的加速度和自转向心力
    ## 地理位置假设在 xz 平面上，且 x 为正
    centripetal_force_acc = np.array([-centripetal_acc_at_geocentric_latitude, 0, 0])
    gravitation_acc = np.array(
        [
            -g_at_geocentric_latitude * np.cos(geocentric_latitude_in_rad),
            0,
            -g_at_geocentric_latitude * np.sin(geocentric_latitude_in_rad),
        ]
    )

    ## 重力的向量
    gravity_acc = gravitation_acc - centripetal_force_acc

    ## 天文纬度
    astronomic_latitude_in_rad = np.arctan2(-gravity_acc[2], -gravity_acc[0])

    return astronomic_latitude_in_rad


geocentric_latitudes = []
astronomic_latitudes = []
for geodetic_latitude in geodetic_latitudes:
    geocentric_latitude = get_geocentric_latitude(np.deg2rad(geodetic_latitude))
    astronomic_latitude_in_rad = get_astronomic_latitude(geocentric_latitude)
    astronomic_latitude = np.rad2deg(astronomic_latitude_in_rad)
    astronomic_latitudes.append(astronomic_latitude)
    geocentric_latitudes.append(np.rad2deg(geocentric_latitude))

# ===============================
#         对比算法
# ===============================

methods = {
    # "naive": naive,
    # "bisect_formular": bisect_formular,
    # "bisect_tabular": bisect_tabular,
    # "series": series,
    "series2": series2,
}


diff = dict()
for method_name, method in methods.items():
    diff[method_name] = []

for geodetic_latitude, astronomic_latitude in zip(
    geodetic_latitudes, astronomic_latitudes
):
    for method_name, method in methods.items():
        solved_geodetic_latitude = method(astronomic_latitude)
        diff[method_name].append(solved_geodetic_latitude - geodetic_latitude)

for method_name, method_diff in diff.items():
    plt.plot(geodetic_latitudes, diff[method_name], label=method_name)

plt.grid(True)
plt.xlabel("real geodetic latitude in degree")
plt.ylabel("error in degree")
plt.legend(loc="best")
plt.show()
