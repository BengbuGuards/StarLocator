import numpy as np


def astronomic_latitude_to_geodetic_latitude(astronomic_latitudes_in_degree):
    return astronomic_latitudes_in_degree - (
        0.00032712 * np.sin(np.deg2rad(astronomic_latitudes_in_degree)) ** 2
        - 0.00000368 * np.sin(np.deg2rad(astronomic_latitudes_in_degree))
        - 0.099161
    ) * np.sin(np.deg2rad(astronomic_latitudes_in_degree) * 2)
