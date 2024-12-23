from fastapi import FastAPI
from routers import astro_coord, moon_time
from routers import locator
import uvicorn

app = FastAPI()


app.include_router(locator.router, prefix="/api/locator", tags=["locator"])
app.include_router(astro_coord.router, prefix="/api/astrocoord", tags=["astrocoord"])
app.include_router(moon_time.router, prefix="/api/moontime", tags=["moontime"])


@app.get("/api")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=6975)
