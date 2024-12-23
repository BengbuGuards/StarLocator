from fastapi import FastAPI
from routers import astro_coord, moon_time
from routers import positioning
from routers.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import uvicorn


app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(positioning.router, prefix="/api/positioning", tags=["positioning"])
app.include_router(astro_coord.router, prefix="/api/astrocoord", tags=["astrocoord"])
app.include_router(moon_time.router, prefix="/api/moontime", tags=["moontime"])


@app.get("/api")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=6975)
