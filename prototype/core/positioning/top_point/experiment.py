import matplotlib.pyplot as plt
import numpy as np
from .methods.matrix_inverse import intersection as matrix_inverse_intersection
from .methods.sphere import intersection as sphere_intersection

two_lines = np.array(
    [
        [(923, 746), (1669, 918)],
        [(920, 752), (1672, 921)],
        [(924, 761), (1685, 930)],
        [(924, 771), (1695, 939)],
        [(927, 781), (1708, 948)],
        [(928, 791), (1719, 954)],
        [(931, 801), (1732, 959)],
        [(932, 811), (1743, 944)],
        [(934, 821), (1755, 952)],
        [(938, 831), (1769, 958)],
        [(936, 842), (1778, 951)],
    ]
)

result1 = sphere_intersection(two_lines)
print(result1)

result2 = matrix_inverse_intersection(two_lines)
print(result2)


plt.figure(figsize=(10, 10))

# 遍历每一行的线段，并绘制
for line in two_lines:
    point1, point2 = line
    plt.plot([point1[0], point2[0]], [point1[1], point2[1]], marker="o")

plt.plot(result1[0], result1[1], marker="o", color="red", label="Sphere")
plt.plot(result2[0], result2[1], marker="o", color="green", label="Matrix Inverse")

# 添加标题和标签
plt.title("Line Segments between Points")
plt.xlabel("X-axis")
plt.ylabel("Y-axis")

# 显示网格
plt.grid()
plt.legend()
# 显示绘图
plt.axis("equal")  # 设置比例相等
plt.show()
