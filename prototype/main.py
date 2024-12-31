from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import astro_coord, moon_time, positioning, astrometry, bmap
from routers.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from config import CORS_ALLOW_ORIGIN, LOG_LEVEL
import uvicorn


app = FastAPI()

# 跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGIN,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 限流
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 分发路由
app.include_router(positioning.router, prefix="/api/positioning", tags=["positioning"])
app.include_router(astro_coord.router, prefix="/api/astrocoord", tags=["astrocoord"])
app.include_router(moon_time.router, prefix="/api/moontime", tags=["moontime"])
app.include_router(astrometry.router, prefix="/api/astrometry", tags=["astrometry"])
app.include_router(bmap.router, prefix="/api/_BMapService", tags=["_BMapService"])


@app.get("/api/")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
    log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
    uvicorn.run(app, host="127.0.0.1", port=6975, log_config=log_config, log_level=LOG_LEVEL)
