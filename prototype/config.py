# 前端服务的基础URL
FRONTEND_BASEURL = "http://localhost:6974"
# 后端服务的基础URL
BACKEND_BASEURL = "http://localhost:6975"
BACKEND_API_BASEURL = BACKEND_BASEURL + "/api"

# 缓存天体坐标的数量
CACHE_SIZE = 1000

# 一次请求最多处理的天体数量
MAX_NUM_OF_STARS = 16

# 一次请求最多处理的直线数量
MAX_NUM_OF_LINES = 16

# 标月定时的最大时间搜索范围（天）
MAX_MOON_SEARCH_RANGE = 365

# 网络请求是否限流
RATE_LIMIT = False
## 标月定时的网络请求限流
MOON_TIME_RATE_LIMIT = "1/5second"
## 天体坐标的网络请求限流
ASTRO_COORD_RATE_LIMIT = "5/second"
## 标星定位的网络请求限流
POSITIONING_RATE_LIMIT = "5/second"

# CORS
CORS_ALLOW_ORIGIN = [
    FRONTEND_BASEURL,
    BACKEND_BASEURL,
]

# 日志等级：debug, info, warning, error, critical
LOG_LEVEL = "info"
