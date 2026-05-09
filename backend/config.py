# 前端服务的基础URL
FRONTEND_BASEURL = "http://localhost:6974"
# 后端服务的基础URL
BACKEND_BASEURL = "http://localhost:6975"
BACKEND_API_BASEURL = BACKEND_BASEURL + "/api"

# 缓存天体坐标的数量
CACHE_SIZE = 1000

# 远程异步请求最大并发数
MAX_CONNECTIONS = 5

# 一次请求最多处理的天体数量
MAX_NUM_OF_STARS = 20

# 一次请求最多处理的直线数量
MAX_NUM_OF_LINES = 20

# 标月定时的最大时间搜索范围（天）
MAX_MOON_SEARCH_RANGE = 365

### 限制上传图片的大小
MAX_UPLOAD_SIZE = 10 * 1024 * 1024

# 日志等级：debug, info, warning, error, critical
LOG_LEVEL = "info"

# API_KEY
## 百度地图 JS API KEY
BMAP_API_KEY = "******"
## astrometry API_KEY
ASTROMETRY_API_KEY = "******"

# 网络请求是否限流
RATE_LIMIT = False
## 只提供代理的，没有较大的并发需求，不限流
## 轻量：存在少量的计算资源消耗
LIGHT_RATE_LIMIT = "5/second"
## 中等：存在一定的计算资源消耗，且有一定的并发需求
MEDIUM_RATE_LIMIT = "1/3second"
## 重度：存在较大的计算资源消耗，或且有较大的并发需求
HEAVY_RATE_LIMIT = "1/6second"

# CORS
CORS_ALLOW_ORIGIN = [
    FRONTEND_BASEURL,
    BACKEND_BASEURL,
    "https://api.map.baidu.com",
]
