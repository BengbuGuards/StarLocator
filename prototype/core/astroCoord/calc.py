import asyncio
import astronomy as ast
from .data import starZH2EN, solar_bodies
from .remote import get_RaDec_by_names


def get_HaDec_by_RaDec(raDec, date, observer=ast.Observer(0, 0, 0)):
    """
    根据J2000赤经赤纬获取时角和赤纬

    param:
        raDec: 赤经赤纬J2000
        date: 日期
        observer: 观测者地理坐标
    return:
        haDec: 时角和赤纬（角度）
    """

    if raDec[0] == None or raDec[1] == None:
        return [None, None]
    ast.DefineStar(ast.Body.Star1, raDec[0], raDec[1], 1000)
    equ_ofdate = ast.Equator(ast.Body.Star1, date, observer, True, True)
    hour_angle = ast.HourAngle(ast.Body.Star1, date, observer)
    return [hour_angle, equ_ofdate.dec]


def get_HaDec_in_solar(star_name, date, observer=ast.Observer(0, 0, 0)):
    """
    根据太阳系天体名称和日期获取其时角和赤纬

    param:
        starName: 天体名称
        date: 日期
        observer: 观察者地理坐标
    return:
        haDec: 时角和赤纬（角度）
    """

    # 将name第一个字母大写，其他字母小写
    star_name = star_name.capitalize()
    star_body = getattr(ast.Body, star_name)
    equ_ofdate = ast.Equator(star_body, date, observer, True, True)
    hour_angle = ast.HourAngle(star_body, date, observer)
    return [hour_angle, equ_ofdate.dec]


def get_HaDec_by_names(star_names, date, observer=ast.Observer(0, 0, 0)):
    """
    根据恒星名称数组获取其时角和赤纬

    param:
        star_names: 恒星名称数组
        date: 日期
        observer: 观察者地理坐标
    return:
        haDec: 时角和赤纬数组（角度）
    """

    ha_desc = dict()  # 时角和赤纬数组（角度）
    fixed_star_names = dict()  # 太阳系外要查询的恒星名（查询名: 操作名）
    solar_star_names = dict()  # 太阳系内要查询的天体名（查询名: 操作名）

    for star_name in star_names:
        operate_name = star_name
        # 如果匹配到汉英对照星表，则转换为英文名
        if operate_name in starZH2EN:
            operate_name = starZH2EN[operate_name]
        operate_name = operate_name.lower()
        if operate_name in solar_bodies:
            solar_star_names[star_name] = operate_name
        else:
            fixed_star_names[star_name] = operate_name

    # 异步获取恒星的赤经和赤纬
    ra_decs = asyncio.run(get_RaDec_by_names(list(fixed_star_names.values())))
    # 同步计算天体的时角和赤纬
    # 计算太阳系外天体的时角和赤纬
    for star_name in fixed_star_names.keys():
        ha_desc[star_name] = get_HaDec_by_RaDec(
            ra_decs[fixed_star_names[star_name]], date, observer
        )

    # 计算太阳系内天体的时角和赤纬
    for star_name, operate_name in solar_star_names.items():
        ha_desc[star_name] = get_HaDec_in_solar(operate_name, date, observer)

    return ha_desc
