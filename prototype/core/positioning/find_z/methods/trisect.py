import numpy as np
from ..utils.math import minimize


def calculate_angle(p1: np.ndarray, p2: np.ndarray, z: float) -> np.ndarray:
    v1 = np.array([*p1, z])
    v2 = np.array([*p2, z])
    cos_theta = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    cos_theta = np.clip(cos_theta, -1, 1)

    return np.arccos(cos_theta)


def get_z(data: dict) -> float:
    """
    Find the focal length.

    params:
        data: (points, thetas). points: list of points. thetas: list of angles in radians
    return:
        z: focal length
    """
    points = data["points"]
    thetas = data["thetas"]

    z = minimize(
        lambda z: sum(
            (calculate_angle(points[i], points[j], z) - thetas[i, j]) ** 2
            for i in range(len(points))
            for j in range(i + 1, len(points))
        ),
        0,
        1e9,
    )

    return z
