import re
import httpx
import asyncio
from .data import solar_bodies
from async_lru import alru_cache
from config import CACHE_SIZE, MAX_CONNECTIONS

# 设置最大并发数
limits = httpx.Limits(
    max_connections=MAX_CONNECTIONS,
    max_keepalive_connections=MAX_CONNECTIONS,
)


@alru_cache(maxsize=CACHE_SIZE)
async def get_RaDec_by_name(
    star_name: str,
) -> tuple[str | None, tuple[float, float] | None]:
    """
    根据恒星名称获取其赤经和赤纬
    Params:
        starName: 恒星名称
    
    Returns:
        raDec: J2000赤经（时）和赤纬（角度）
    """

    # 不查询太阳系天体
    if star_name in solar_bodies:
        return (None, None)

    star_name_base64 = re.sub(r"\s+", "+", star_name)

    async with httpx.AsyncClient(limits=limits) as client:
        response = await client.get(
            f"https://simbad.u-strasbg.fr/simbad/sim-nameresolver?ident={star_name_base64}&output=json&data=J&option=strict"
        )
        if response.status_code != 200:
            raise ValueError(
                f"Failed request astrocoord with status code {response.status_code}"
            )
        data = response.json()
        ra = data[0]["ra"] / 15
        dec = data[0]["dec"]
        return (star_name, (ra, dec))


async def get_RaDecs_by_names(
    star_names: list[str],
) -> dict[str, tuple[float | None, float | None]]:
    """
    根据恒星名称数组获取其赤经和赤纬
    Params:
        star_names: 恒星名称列表
    
    Returns:
        raDecs: 赤经和赤纬字典（角度）
    """

    tasks = [get_RaDec_by_name(starName) for starName in star_names]
    raDecs_tmp = []
    for task in asyncio.as_completed(tasks):
        try:
            raDec = await task
            raDecs_tmp.append(raDec)
        except ValueError:
            pass
    raDecs_tmp = dict(raDecs_tmp)

    raDecs_dict = dict()
    for star_name in star_names:
        raDecs_dict[star_name] = raDecs_tmp.get(star_name, (None, None))

    return raDecs_dict
