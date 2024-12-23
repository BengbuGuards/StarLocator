import numpy as np
import astronomy as ast
from ..utils.math import cart2sph, sph2cart, vector_angle, rad2deg, deg2rad


def get_geo(data: dict, is_fix_refraction: bool = False):
    """
    Find the geographical position.

    params:
        datas: a dict including:
            points: (n, 3), star points
            top_point: (3，) top point
            hour_decs: (n, 2), hour angle and declination
            z: (1,), focal length
        is_fix_refraction: whether to fix refraction
    return:
        geo: (2,), geographical position about longitude and latitude
    """
    ## 获取数据
    points = data["points"]
    top_point = data["top_point"]
    n_points = len(points)
    data["n_points"] = n_points

    ## 计算各星天顶角余弦值
    cos_theta = points @ top_point
    if is_fix_refraction:
        star_altitudes = 90 - rad2deg(np.acos(cos_theta))  # 高度角（角度）
        real_star_altitudes = deg2rad(
            np.array(
                [
                    angle + ast.InverseRefractionAngle(ast.Refraction.Normal, angle)
                    for angle in star_altitudes
                ]
            )
        )  # 去折射的高度角（弧度）
        cos_theta = np.cos(np.pi / 2 - real_star_altitudes)
    data["cos_theta"] = cos_theta

    ## 每双星计算得出双解
    crude_positions = []
    for i in range(n_points):
        for j in range(i + 1, n_points):
            # 忽略sqrt负数的警告
            with np.errstate(invalid="ignore"):
                results = dual_star_positioning(data, i, j)
            if (
                np.isnan(results[0]).any() == False
                and np.isnan(results[1]).any() == False
            ):
                crude_positions.append(results)

    ## 检查是否有解
    if len(crude_positions) == 0:
        raise Exception("无解")

    ## 加权平均
    geo = square_median_average(crude_positions, data)

    return geo


def dual_star_positioning(data, i, j):
    """
    根据双星计算地理坐标，返回双解
    """
    plane1 = get_plane(data, i)
    plane2 = get_plane(data, j)

    ## 计算两平面与圆的两交点
    return get_plane_intersection(plane1, plane2)


def get_plane(data, i):
    """
    根据星点计算平面方程
    """
    cos_theta = data["cos_theta"][i]
    hour_angle = data["hour_decs"][i][0]
    declination = data["hour_decs"][i][1]

    a = cos_theta * np.cos(hour_angle) * np.cos(declination)
    b = np.sin(hour_angle) * cos_theta * np.cos(declination)
    c = np.sin(declination) * cos_theta
    d = cos_theta**2

    return np.array([a, b, c, d])


def get_plane_intersection(plane1, plane2):
    """
    计算两平面交点
    """
    A1, B1, C1, D1 = plane1
    A2, B2, C2, D2 = plane2

    x1 = (
        -A1 * B1 * B2 * D2
        + A1 * B2**2 * D1
        - A1 * C1 * C2 * D2
        + A1 * C2**2 * D1
        + A2 * B1**2 * D2
        - A2 * B1 * B2 * D1
        + A2 * C1**2 * D2
        - A2 * C1 * C2 * D1
        - B1
        * C2
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
        + B2
        * C1
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    )
    y1 = (
        A1**2 * B2 * D2
        - A1 * A2 * B1 * D2
        - A1 * A2 * B2 * D1
        + A1
        * C2
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
        + A2**2 * B1 * D1
        - A2
        * C1
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
        - B1 * C1 * C2 * D2
        + B1 * C2**2 * D1
        + B2 * C1**2 * D2
        - B2 * C1 * C2 * D1
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    )
    z1 = (
        -(A1 * B2 - A2 * B1)
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    ) + (
        A1**2 * C2 * D2
        - A1 * A2 * C1 * D2
        - A1 * A2 * C2 * D1
        + A2**2 * C1 * D1
        + B1**2 * C2 * D2
        - B1 * B2 * C1 * D2
        - B1 * B2 * C2 * D1
        + B2**2 * C1 * D1
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    )
    x2 = (
        -A1 * B1 * B2 * D2
        + A1 * B2**2 * D1
        - A1 * C1 * C2 * D2
        + A1 * C2**2 * D1
        + A2 * B1**2 * D2
        - A2 * B1 * B2 * D1
        + A2 * C1**2 * D2
        - A2 * C1 * C2 * D1
        + B1
        * C2
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
        - B2
        * C1
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    )
    y2 = (
        A1**2 * B2 * D2
        - A1 * A2 * B1 * D2
        - A1 * A2 * B2 * D1
        - A1
        * C2
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
        + A2**2 * B1 * D1
        + A2
        * C1
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
        - B1 * C1 * C2 * D2
        + B1 * C2**2 * D1
        + B2 * C1**2 * D2
        - B2 * C1 * C2 * D1
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    )
    z2 = (
        (A1 * B2 - A2 * B1)
        * np.sqrt(
            A1**2 * B2**2
            + A1**2 * C2**2
            - A1**2 * D2**2
            - 2 * A1 * A2 * B1 * B2
            - 2 * A1 * A2 * C1 * C2
            + 2 * A1 * A2 * D1 * D2
            + A2**2 * B1**2
            + A2**2 * C1**2
            - A2**2 * D1**2
            + B1**2 * C2**2
            - B1**2 * D2**2
            - 2 * B1 * B2 * C1 * C2
            + 2 * B1 * B2 * D1 * D2
            + B2**2 * C1**2
            - B2**2 * D1**2
            - C1**2 * D2**2
            + 2 * C1 * C2 * D1 * D2
            - C2**2 * D1**2
        )
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    ) + (
        A1**2 * C2 * D2
        - A1 * A2 * C1 * D2
        - A1 * A2 * C2 * D1
        + A2**2 * C1 * D1
        + B1**2 * C2 * D2
        - B1 * B2 * C1 * D2
        - B1 * B2 * C2 * D1
        + B2**2 * C1 * D1
    ) / (
        A1**2 * B2**2
        + A1**2 * C2**2
        - 2 * A1 * A2 * B1 * B2
        - 2 * A1 * A2 * C1 * C2
        + A2**2 * B1**2
        + A2**2 * C1**2
        + B1**2 * C2**2
        - 2 * B1 * B2 * C1 * C2
        + B2**2 * C1**2
    )

    solve1 = cart2sph(x1, y1, z1)
    solve2 = cart2sph(x2, y2, z2)
    return [
        [solve1[0], solve1[1]],
        [solve2[0], solve2[1]],
    ]  # 先经度后纬度


def square_median_average(crude_positions, data):
    """
    计算加权平均
    """

    def evaluate(pos):
        """
        评估解的合理性
        """
        sum = 0
        for i in range(data["n_points"]):
            ## 计算该位置的实际天顶角
            angle = vector_angle(
                np.array(sph2cart(*data["hour_decs"][i])), np.array(sph2cart(*pos, 1))
            )
            diff = angle - np.arccos(data["cos_theta"][i])
            sum += diff**2
        return 1 / sum

    # 评估，保留一对解中的正确的位置和评估值
    positions = []
    avg_position = []
    for pair in crude_positions:
        s1 = evaluate(pair[0])
        s2 = evaluate(pair[1])
        true_pair = pair[0] if s1 > s2 else pair[1]
        positions.append(true_pair)
        true_pair = sph2cart(*true_pair, 1)
        avg_position.append(true_pair)

    # 计算平均向量
    avg_position = np.array(avg_position)
    avg_position = np.mean(avg_position, axis=0)

    # 根据平均值消除经纬度的周期性，防止中位数在0经线附近计算错误
    positions2 = []
    for pos in positions:
        lon = adjust_angle(pos[0], avg_position[0])
        lat = adjust_angle(pos[1], avg_position[1])
        positions2.append([lon, lat])
    positions2 = np.array(positions2)

    # 求positions中位数，相比于平均值，中位数鲁棒性更好
    median_geo = np.median(positions2, axis=0)

    return median_geo


def adjust_angle(angle, avg_angle):
    if angle - avg_angle > 180:
        return angle - 360
    elif angle - avg_angle < -180:
        return angle + 360
    else:
        return angle
