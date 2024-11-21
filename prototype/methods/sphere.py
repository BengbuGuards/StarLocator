import numpy as np


def intersection(lines: list) -> tuple:
    """
    Find the intersection point of given lines.
    params:
        lines: numpy array, each row contains two points. [((x1, y1), (x2, y2)), ...]
    return:
        intersection point (x, y)
    """
    ## 设置焦点
    z = 1000
    ## 计算每条线所处平面的法向量
    normals = []
    for line in lines:
        x1, y1 = line[0]
        x2, y2 = line[1]
        a = np.array([x1, y1, z])
        b = np.array([x2, y2, z])
        normal = np.cross(a, b)
        normals.append(normal)
    normals = np.array(normals, dtype=np.float32)
    normals /= np.linalg.norm(normals, axis=1, keepdims=True)
    ## 计算灭点
    ## normals * point = 0
    A = normals.T @ normals
    ## 对A进行特征值分解，选择最小的特征值对应的特征向量
    _, V = np.linalg.eig(A)
    point = V[:, np.argmin(np.linalg.eigvals(A))]
    ## 归一化
    point *= z / point[2]

    return point[:2]
