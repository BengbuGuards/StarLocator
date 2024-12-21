import numpy as np
from ..utils.math import cart2sph, sph2cart


def get_geo(data: dict):
    """
    Find the geographical position.

    params:
        datas: a dict including:
            points: (n, 3), star points
            top_point: (3，) top point
            hour_decs: (n, 2), hour angle and declination
            z: (1,), focal length
    return:
        geo: (2,), geographical position about longitude and latitude
    """
    ## 获取数据
    points = data["points"]
    top_point = data["top_point"]
    hour_decs = data["hour_decs"]

    ## 计算各星天顶角余弦值
    cos_theta = points @ top_point
    ## 将星参考时角&赤纬转换为直角坐标
    hour_decs_cart = np.array([sph2cart(*hour_de) for hour_de in hour_decs])
    ## 使用伪逆求解地理坐标
    geo_cart = np.linalg.pinv(hour_decs_cart) @ cos_theta
    ## 转换为球坐标
    geo = np.array(cart2sph(*geo_cart)[:2])
    return geo
