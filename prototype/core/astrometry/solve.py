import httpx
import asyncio
import numpy as np
import sep_pjw as sep
from PIL import Image
from io import BytesIO
import astronomy as ast
from astropy.io import fits
from ..astro_coord.utils import stamp2ast_time
from .client import ClientRunnerOptions, run_client
from core.astro_coord.calc import get_HaDec_by_RaDec
from ..positioning.locator.utils.math import sph_dist
from config import ASTROMETRY_API_KEY, MAX_CONNECTIONS
from ..astro_coord.data import solar_bodies, starEN2ZH, solar_body_mags

# 设置最大并发数
limits = httpx.Limits(
    max_connections=MAX_CONNECTIONS,
    max_keepalive_connections=MAX_CONNECTIONS,
)


def flux_in_img(images: list[Image.Image]) -> list[float]:
    """
    Calculate the flux of stars in every images.

    Args:
        images: The images to calculate the flux.

    Returns:
        fluxs: The flux of stars in every images.
    """

    fluxs = []
    for image in images:
        image = image.convert("L")
        image = np.array(image, dtype=np.float64)
        bkg = sep.Background(image)
        image_sub = image - bkg
        # 使用一个阈值来检测星星，如果检测不到星星，就降低阈值
        thresh = 32
        objects = dict()  # 用于存储在图上检测到的星星信息
        while thresh >= 1:
            objects = sep.extract(
                image_sub,
                thresh,
                minarea=1,
                clean=True,
                clean_param=1.0,
            )
            if len(objects["flux"]) == 0:
                thresh /= 2
            else:
                break

        if len(objects["flux"]) == 0:
            # 实在检测不到星星，就返回0
            fluxs.append(0)
        elif len(objects["flux"]) == 1:
            fluxs.append(objects["flux"][0])
        else:
            # 如果检测到多个星星，就返回中间的那个
            positions = np.array([objects["x"], objects["y"]]).T
            center = np.array(image.shape) / 2
            distances = np.linalg.norm(positions - center, axis=1)
            fluxs.append(objects["flux"][np.argmin(distances)])
    return fluxs


def tune_rd(
    xy2field_rd: dict, timestamp: float, radius: float = 60, max_mag: float = 6
) -> dict[tuple[float, float], tuple[float, float, str]]:
    """
    Tune the right ascension and declination of the stars.

    Args:
        xy2field_rd: The mapping from the positions of the stars to the right ascension and declination.
        timestamp: The timestamp of the observation.
        radius: The radius to search for the stars, in arcmins.
        max_mag: The maximum magnitude of the star.

    Returns:
        xy2index_rd_names: The mapping from the positions of the stars to the right ascension, declination and name.
    """

    xy2index_rd_names_mag = dict()  # 图上点坐标到赤道坐标、名称和视星等的映射
    fixed_xy2field_rd = dict()  # 太阳系外要查询的恒星名（查询名: 操作名）
    solar_stars = SolarStars(
        timestamp, max_mag
    )  # 初始化太阳系天体信息，缓存以便于后续查询
    # 先从太阳系外天体中找
    for xy in xy2field_rd.keys():
        ra, dec = xy2field_rd[xy]
        seperate = "+" if dec > 0 else ""
        fixed_xy2field_rd[xy] = (
            f"{ra.item()}{seperate}{dec.item()}"  # 生成供SIMBAD查询的坐标
        )
    xy2index_rd_names_mag = get_fixed_stars(fixed_xy2field_rd, radius, max_mag)
    # 在从太阳系天体中找
    for xy in xy2field_rd.keys():
        ra, dec = xy2field_rd[xy]
        solar_index_rd, solar_name, solar_mag = solar_stars.get_solar_stars(
            ra, dec, radius
        )
        if solar_name and solar_mag <= xy2index_rd_names_mag[xy][3]:
            xy2index_rd_names_mag[xy] = (*solar_index_rd, solar_name, solar_mag)
    # 删除xy2index_rd_names中的mag信息
    xy2index_rd_names_mag = {
        xy: xy2index_rd_names_mag[xy][:3] for xy in xy2index_rd_names_mag
    }
    return xy2index_rd_names_mag


class SolarStars:
    def __init__(self, timestamp: float, max_mag: float):
        """
        Initialize the SolarStars.

        Args:
            timestamp: The timestamp of the observation.
            max_mag: The maximum magnitude of the star.
        """
        # 先获取所有太阳系天体的赤道坐标
        time = stamp2ast_time(timestamp)
        observer = ast.Observer(0, 0, 0)  # 无先验信息，随便取个位置
        self.all_infos = []
        for star_name in solar_bodies:
            if solar_body_mags[star_name] > max_mag:
                continue
            # 将name第一个字母大写，其他字母小写
            star_name = star_name.capitalize()
            star_body = getattr(ast.Body, star_name)
            equ_ofdate = ast.Equator(star_body, time, observer, True, True)
            self.all_infos.append(
                (
                    (equ_ofdate.ra * 15, equ_ofdate.dec),
                    star_name,
                    solar_body_mags[star_name.lower()],
                )
            )

    def get_solar_stars(
        self, ra: float, dec: float, radius: float
    ) -> tuple[tuple[float, float], str | None, float]:
        """
        Get the solar star that is closest to the given right ascension and declination.

        Args:
            ra: The right ascension.
            dec: The declination.
            radius: The radius to search for the stars, in arcmins.

        Returns:
            solar_index_rd: The right ascension and declination of the solar star.
            solar_name: The name of the solar star.
            mag: The magnitude of the solar star.
        """
        # 计算所有太阳系天体和给定坐标的距离，返回radius半径内的最亮的太阳系天体
        all_rds = np.array([info[0] for info in self.all_infos])
        center = np.array([ra, dec])
        distances = sph_dist(all_rds[:, 0], all_rds[:, 1], center[0], center[1], "deg")
        target_idxs = np.argwhere(distances <= radius / 60).flatten()
        if len(target_idxs) == 0:
            return (0, 0), None, 100
        target_idx = target_idxs[
            np.argmin([self.all_infos[idx][2] for idx in target_idxs])
        ]
        return self.all_infos[target_idx]


def get_fixed_stars(
    fixed_xy2field_rd: dict, radius: float, max_mag: float
) -> dict[tuple[float, float], tuple[float, float, str, float]]:
    """
    Find the fixed stars that is closest to the given right ascension and declination.

    Args:
        fixed_xy2field_rd: The mapping from the positions of the stars to the ascension and declination in the image.
        radius: The radius to search for the stars, in arcmins.
        max_mag: The maximum magnitude of the star.

    Returns:
        The mapping from the positions of the stars to the right ascension, declination, name and magnitude.
    """

    async def find_star(
        xy: tuple[float, float], field_rd: str
    ) -> tuple[tuple[float, float], tuple[float, float, str, float]]:
        """
        Find the star that is closest to the given right ascension and declination.

        Args:
            xy: The position of the star in the image.
            field_rd: The right ascension and declination of the star.

        Returns:
            The right ascension, declination and name of the star.
        """
        # 发送请求
        async with httpx.AsyncClient(limits=limits) as client:
            # 查询参数
            params = {
                "coord": field_rd,
                "output": "json",
                "radius": radius,
                "data": "J(2d;c) I.0 M(V)",
            }
            response = await client.post(
                "https://simbad.u-strasbg.fr/simbad/sim-nameresolver",
                params=params,
                timeout=10,
            )
            # 处理返回结果
            ra, dec = field_rd.split("-") if "-" in field_rd else field_rd.split("+")

            if response.text.startswith("!! No astronomical object found :"):
                # 如果找不到，就返回原来的坐标
                return (xy, (float(ra), float(dec), "Unknown", 100))

            # 按视星等数值从小到大排序，把最亮的天体选出
            found_results = response.json()
            found_results = sorted(
                found_results, key=lambda x: float(x.get("M.V", 100))
            )
            found_result = found_results[0]
            mag = float(found_result.get("M.V", 100))

            # 如果找到的天体视星等大于最大视星等，也返回原来的坐标
            if mag > max_mag:
                return (xy, (float(ra), float(dec), "Unknown", 100))

            # 成功找到一定半径内的亮星，返回其信息
            ra, dec = found_result["coord"].split()[:2]
            return (
                xy,
                (
                    float(ra),
                    float(dec),
                    found_result["mainId"].lstrip("* "),
                    mag,
                ),
            )

    # 并发查询
    async def task_pack():
        tasks = [find_star(xy, field_rd) for xy, field_rd in fixed_xy2field_rd.items()]
        return await asyncio.gather(*tasks)

    raw_resp_infos = asyncio.run(task_pack())

    # 转为字典
    fixed_xy2index_rd_name_mags = dict()
    for xy, rd_name in raw_resp_infos:
        fixed_xy2index_rd_name_mags[xy] = rd_name
    return fixed_xy2index_rd_name_mags


def submit(
    sub_images: list[Image.Image],
    xy: list[tuple[float, float]],
    image_width: int,
    image_height: int,
    scale_units: str = "degwidth",
    scale_lower: float = 10,
    scale_upper: float = 180,
) -> tuple[str, str | None]:
    """
    Solve the astrometry of an image.

    Args:
        images: The images to solve.
        xy: The positions of the stars in the image.
        image_width: The width of the image.
        image_height: The height of the image.
        scale_units: The unit of the scale.
        scale_lower: The lower bound of the scale.
        scale_upper: The upper bound of the scale.

    Returns:
        detail: Whether the solving is successful.
        job_id: The id of the job.
    """

    # 计算所有图片的星星flux
    fluxs = np.array(flux_in_img(sub_images))
    # 按flux从大到小排序
    xy_formated = np.array(xy).round(decimals=2)  # 保留两位小数
    sorted_xy = xy_formated[np.argsort(-fluxs)]
    # Get the options for the client
    options = ClientRunnerOptions(
        apikey=ASTROMETRY_API_KEY,
        upload_xy=sorted_xy.T.tolist(),
        image_width=image_width,
        image_height=image_height,
        scale_units=scale_units,
        scale_lower=scale_lower,
        scale_upper=scale_upper,
        parity="1",
        public="n",
    )
    # Run the client
    try:
        detail, job_id = run_client(options)
        job_id = str(job_id)
    except Exception as e:
        detail = str(e)
        job_id = None
    return detail, job_id


def recognize(
    job_id: str,
    xy: list[tuple[float, float]],
    timestamp: float,
    radius: float = 60,
    max_mag: float = 6,
    is_zh: bool = False,
) -> tuple[str, list[tuple[float, float, str]] | None]:
    """
    Recognize the stars in the image.

    Args:
        job_id: The ID of the job.
        xy: The positions of the stars in the image.
        timestamp: The timestamp of the observation.
        radius: The radius to search for the stars, in arcmins.
        max_mag: The maximum magnitude of the star.
        is_zh: Whether to translate the star names into 中文.

    Returns:
        detail: Whether the solving is successful.
        hd_names: The hour angle, declination and name of the stars.
    """
    # 查询任务状态
    detail = httpx.get(f"https://nova.astrometry.net/api/jobs/{job_id}").json()[
        "status"
    ]

    if detail == "success":
        rdls_url = f"https://nova.astrometry.net/image_rd_file/{job_id}"
        content = httpx.get(rdls_url).content
        xy2field_rd = dict()  # 星点坐标到图中赤道坐标的映射
        with fits.open(BytesIO(content)) as hdul:
            hdul_data = hdul[1].data  # type: ignore
            for i in range(len(xy)):
                xy2field_rd[
                    (
                        hdul_data["x"][i].item(),
                        hdul_data["y"][i].item(),
                    )
                ] = (
                    hdul_data["ra"][i],
                    hdul_data["dec"][i],
                )
        try:
            # 根据图中赤道坐标，寻找最接近的星星的真实赤道坐标和名称
            xy2rd_names = tune_rd(xy2field_rd, timestamp, radius, max_mag)
            # xy保留小数点后两位
            round_xy = np.array(xy).round(decimals=2).tolist()
            # 返回输入顺序的星星的真实时角坐标和名称
            hd_names = []
            assert type(round_xy) == list
            for xy_item in round_xy:
                rd_name = xy2rd_names[(float(xy_item[0]), float(xy_item[1]))]  # type: ignore
                ra, dec = rd_name[:2]
                hour_ra = get_HaDec_by_RaDec((ra / 15, dec), stamp2ast_time(timestamp))
                star_name = rd_name[2]
                if is_zh:
                    # 尝试汉化星名
                    star_name = starEN2ZH.get(star_name.lower(), star_name)
                hd_names.append((*hour_ra, star_name))
        except Exception as e:
            detail = str(e)
            return detail, None
        return detail, hd_names
    else:
        return detail, None
