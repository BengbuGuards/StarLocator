import astronomy as ast
from time import sleep
from datetime import datetime
from astroCoord.calc import get_HaDec_by_names

starNames = ["北落师门", "火鸟六", "土司空", "室宿一", "危宿三", "月球"]

# '2000-01-01T12:00:00' 至 '2024-10-14T16:00:00' 的天数（浮点数）
time = ast.Time(
    (datetime(2024, 10, 14, 16) - datetime(2000, 1, 1, 12)).total_seconds() / 86400
)

print("First:")
print(get_HaDec_by_names(starNames, time))
sleep(2)
print("Again:")
print(get_HaDec_by_names(starNames, time))
print("Again:")
print(get_HaDec_by_names(starNames, time))
