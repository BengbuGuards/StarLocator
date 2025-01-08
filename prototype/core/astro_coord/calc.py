import asyncio
import astronomy as ast
from .data import starZH2EN, solar_bodies
from .remote import get_RaDecs_by_names
from .utils import stamp2ast_time


def get_HaDec_by_RaDec(
    raDec: tuple[float | None, float | None],
    date: ast.Time,
    observer: ast.Observer = ast.Observer(0, 0, 0),
) -> tuple[float | None, float | None]:
    """
    根据J2000赤经赤纬获取时角和赤纬

    Params:
        raDec: 赤经赤纬J2000
        date: 日期
        observer: 观测者地理坐标
    
    Returns:
        haDec: 时角和赤纬（角度）
    """

    if raDec[0] is None or raDec[1] is None:
        return (None, None)
    ast.DefineStar(ast.Body.Star1, raDec[0], raDec[1], 1000)
    equ_ofdate = ast.Equator(ast.Body.Star1, date, observer, True, True)
    hour_angle = ast.HourAngle(ast.Body.Star1, date, observer)
    return (hour_angle, equ_ofdate.dec)


def get_HaDec_in_solar(
    star_name: str, date: ast.Time, observer: ast.Observer = ast.Observer(0, 0, 0)
) -> tuple[float | None, float | None]:
    """
    根据太阳系天体名称和日期获取其时角和赤纬

    Params:
        starName: 天体名称
        date: 日期
        observer: 观察者地理坐标
    
    Returns:
        haDec: 时角和赤纬（角度）
    """

    # 将name第一个字母大写，其他字母小写
    star_name = star_name.capitalize()
    star_body = getattr(ast.Body, star_name)
    equ_ofdate = ast.Equator(star_body, date, observer, True, True)
    hour_angle = ast.HourAngle(star_body, date, observer)
    return (hour_angle, equ_ofdate.dec)


def get_HaDecs_by_names(
    star_names: list[str],
    timestamp: float,
    observer: ast.Observer = ast.Observer(0, 0, 0),
) -> tuple[dict[str, tuple[float | None, float | None]], str]:
    """
    根据恒星名称数组获取其时角和赤纬

    Params:
        star_names: 恒星名称数组
        timestamp: 时间戳
        observer: 观察者地理坐标
    
    Returns:
        haDec: 时角和赤纬字典（角度）
        is_success: 是否成功获取恒星赤经赤纬
    """

    ha_desc = dict()  # 时角和赤纬数组（角度）
    fixed_star_names = dict()  # 太阳系外要查询的恒星名（查询名: 操作名）
    solar_star_names = dict()  # 太阳系内要查询的天体名（查询名: 操作名）
    detail = "success"  # 是否成功获取恒星赤经赤纬
    ast_time = stamp2ast_time(timestamp)

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
    ra_decs = asyncio.run(get_RaDecs_by_names(list(fixed_star_names.values())))
    # 同步计算天体的时角和赤纬
    # 计算太阳系外天体的时角和赤纬
    for star_name in fixed_star_names.keys():
        ha_desc[star_name] = get_HaDec_by_RaDec(
            ra_decs[fixed_star_names[star_name]], ast_time, observer
        )

    # 计算太阳系内天体的时角和赤纬
    for star_name, operate_name in solar_star_names.items():
        ha_desc[star_name] = get_HaDec_in_solar(operate_name, ast_time, observer)

    # 检查是否成功获取恒星赤经赤纬
    for star_name in star_names:
        if ha_desc[star_name][0] is None or ha_desc[star_name][1] is None:
            detail = "fail"
            break

    return ha_desc, detail
