import numpy as np
import astronomy as ast
from ..utils.math import minimize, normalize
from core.positioning.locator.utils.math import vector_angle


def get_z(data: dict, z0: float, zenith: np.ndarray) -> float:
    """
    Find the focal length considering refraction.

    Args:
        data: (points, thetas, ra_decs).
            points: x/y list of points.
            thetas: list of angles in radians.
            ra_decs: list of ra and dec in radians.
        z0: initial guess of focal length
        zenith: zenith point, 2d array

    Returns:
        z: focal length
    """
    points = data["points"]
    thetas = data["thetas"]

    # z的上下限10%
    z_min = z0 * 0.9
    z_max = z0 * 1.1

    # 使用优化函数求解
    def z_error(z):
        # 计算天顶的观测向量
        zenith_vector = np.array([*zenith, z])
        # 计算各星的观测向量
        star_vector_observer = np.concatenate(
            [points, np.ones((len(points), 1)) * z], axis=1
        )
        # 计算各星高度角
        star_angles = np.pi / 2 - np.array(
            [
                vector_angle(star_vector_observer[i], zenith_vector)
                for i in range(len(star_vector_observer))
            ]
        )
        # 计算去折射高度角修正值（添加到zenithAngles上就是未折射时的高度角）
        star_refraction = np.array(
            [
                ast.InverseRefractionAngle(ast.Refraction.Normal, np.rad2deg(angle))
                for angle in star_angles
            ]
        )
        # 计算去折射后的各星的观测向量
        star_vector_real = np.array(
            [
                rotate(star_vector_observer[i], zenith_vector, star_refraction[i])
                for i in range(len(star_vector_observer))
            ]
        )
        # 计算去折射后的各星夹角
        angles_real = np.array(
            [
                vector_angle(star_vector_real[i], star_vector_real[j])
                for i in range(len(star_vector_real))
                for j in range(i + 1, len(star_vector_real))
            ]
        )
        # 计算夹角总误差
        error = np.sum((angles_real - thetas[np.triu_indices(len(points), k=1)]) ** 2)

        return error

    z = minimize(
        z_error,
        z_min,
        z_max,
    )

    return z


def rotate(vector: np.ndarray, zenith_vec: np.ndarray, angle: float) -> np.ndarray:
    """
    Rotate a vector towards a zenith vector by a given angle.

    Params:
        vector: vector to rotate
        zenith_vec: zenith vector
        angle: angle to rotate in degrees

    Returns:
        rotated element vector
    """
    # 单位化
    vector = normalize(vector)
    zenith_vec = normalize(zenith_vec)
    # 旋转轴
    axis = np.cross(vector, zenith_vec)
    # 旋转角度
    angle = np.deg2rad(angle)
    # 罗德里格斯旋转公式
    rotated = (
        vector * np.cos(angle)
        + np.cross(axis, vector) * np.sin(angle)
        + axis * np.dot(axis, vector) * (1 - np.cos(angle))
    )
    return rotated
