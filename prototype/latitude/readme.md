## 重力修正

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

根据下面方法，计算出万有引力。强假设：万有引力朝向地心

根据力的分解，可以由三角函数，求出重力与万有引力的夹角，即天文纬度与地心纬度的夹角。

再由地心纬度，求出大地纬度

#### 万有引力

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

#### Somigliana 方程

https://en.wikipedia.org/wiki/Theoretical_gravity

$$g(\phi )=g_{e}\left[{\frac {1+k\sin ^{2}(\phi )}{\sqrt {1-e^{2}\sin ^{2}(\phi )}}}\right]$$

其中

$$k={\frac {b\cdot g_{p}}{a\cdot g_{e}}}-1$$

WGS84 公式的参数为

$$a = 6378137$$
$$f = 1/298.257223563$$
$$g_e = 9.7803253359\ \text{m}/\text{s}$$
$$g_p = 9.8321849378\ \text{m}/\text{s}$$

### todo

需要验证一下，天文纬度在赤道上的点，计算出的大地纬度是不是还是赤道

### 备注

https://en.wikipedia.org/wiki/Theoretical_gravity

还给出了重力与万有引力夹角的近似公式

$$\frac{\sin 2\phi}{2g}\cdot R\Omega^2$$

其中

$$g=g_{45}-{\tfrac {1}{2}}(g_{\mathrm {poles} }-g_{\mathrm {equator} })\cos \left(2\varphi\right)$$

$$g_{\mathrm {poles}} = 9.832$$
$$g_{45} = 9.806$$
$$g_{\mathrm {equator} } = 9.780$$
$$R\approx 6370\ \text{km}$$


原参考文献需付费下载，可以参考引用它的[文章](https://arxiv.org/pdf/2311.09357)的第 6-7 页
