import numpy as np


def vector_angle(vec1: np.ndarray, vec2: np.ndarray) -> np.ndarray:
    cos_theta = np.dot(vec1, vec2.T) / (
        np.linalg.norm(vec1, axis=-1) * np.linalg.norm(vec2, axis=-1)
    )
    cos_theta = np.clip(cos_theta, -1, 1)
    return np.arccos(cos_theta)


def cart2sph(x: float, y: float, z: float) -> tuple:
    hxy = np.hypot(x, y)
    r = np.hypot(hxy, z)
    elev = np.arctan2(z, hxy)  # for elevation angle defined from Z-axis down
    az = np.arctan2(y, x)
    return az, elev, r


def sph2cart(az: float, elev: float, r: float = 1) -> tuple:
    rcos_theta = r * np.cos(elev)
    x = rcos_theta * np.cos(az)
    y = rcos_theta * np.sin(az)
    z = r * np.sin(elev)
    return x, y, z


def sph_dist(
    az1: np.ndarray,
    elev1: np.ndarray,
    az2: np.ndarray,
    elev2: np.ndarray,
    unit: str = "rad",
) -> np.ndarray:
    if unit == "deg":
        az1 = np.deg2rad(az1)
        elev1 = np.deg2rad(elev1)
        az2 = np.deg2rad(az2)
        elev2 = np.deg2rad(elev2)
    result = np.arccos(
        np.sin(elev1) * np.sin(elev2)
        + np.cos(elev1) * np.cos(elev2) * np.cos(az1 - az2)
    )
    if unit == "deg":
        result = np.rad2deg(result)
    return result
