## 方法评估

series3 目前最好，原理见 `series_model.py`

## 建模

把地球近似看成是个椭球体

1. 按纬度圈来切，截面是正圆
1. 按子午圈来切，截面是椭圆
    1. 长轴 $a$ 为地心到赤道
    1. $$f=1-\frac{b}{a}$$ 为扁率
    1. 短轴 $$b=a(1-f)$$ 为地心到两极
    1. $$e^{2}=1-{\frac {b^{2}}{a^{2}}}=2f-f^2$$ 是椭球体的平方偏心率
1. $g_e, g_p$分别是赤道和两极处定义的重力加速度

### 几种纬度

[天文纬度](https://en.wikipedia.org/wiki/Latitude#Astronomical_latitude)，是铅垂线（重力方向）与赤道面的夹角（需要考虑地球自转），已知变量

[大地纬度](https://en.wikipedia.org/wiki/Latitude) $\phi$，是椭球面切面法线，与赤道面的夹角。目标变量

[地心纬度](https://en.wikipedia.org/wiki/Latitude#Geocentric_latitude) $\theta$，是从地心到该点的向量，与赤道面的夹角

$$\tan\theta = (1-f)^2\tan\phi$$

### 计算步骤

万有引力的一部分，提供了沿纬度圈进行地球自转的向心力，另一部分提供了重力

重力可以由下面 Somigliana 方程来计算大小

根据下面方法，计算出万有引力。

#### 万有引力

强假设：万有引力朝向地心。

两极处的重力等于万有引力

$$\frac{GMm}{b^2}=mg_p$$

地心纬度 $\theta$ 处的地心半径的平方为

$$d^2=a^2\cos^2\theta+b^2\sin^2\theta=a^2\left(1-e^2\cdot \sin^2\theta\right)$$

万有引力为

$$F=\frac{GMm}{d^2}$$

万有引力的加速度为

$$a_g=\frac{GM}{d^2}=\frac{g_pb^2}{d^2}=g_p\frac{(1-f)^2}{1-e^2\cdot\sin^2\theta}$$

#### 向心加速度

[恒星日](https://en.wikipedia.org/wiki/Sidereal_time)时长为 $T=86164.0905$ 秒

向心加速度与地心纬度相关

$$a_c = \Omega^2 r = \left(\frac{2\pi}{T}\right)^2\cdot r = a\cdot \left(\frac{2\pi}{T}\right)^2\cdot \cos\theta$$
