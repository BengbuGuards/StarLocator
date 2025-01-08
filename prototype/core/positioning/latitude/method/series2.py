import numpy as np


def astronomic_latitude_to_geodetic_latitude(astronomic_latitudes_in_degree: np.ndarray) -> np.ndarray:
    bn = [
        0.0016248797304581834,
        -1.5959025318697836e-06,
        1.7384354350353823e-09,
        6.2648178203277005e-12,
        -2.723302870849e-14,
    ]

    angle_rad = np.deg2rad(astronomic_latitudes_in_degree)

    res = 0
    for i, b in enumerate(bn):
        res += b * np.sin(2 * (i + 1) * angle_rad)

    return astronomic_latitudes_in_degree + np.rad2deg(res)
