from fastapi import FastAPI
from routers import locator, astroCoord, moonTime

app = FastAPI()


app.include_router(locator.router, prefix="/locator", tags=["locator"])
app.include_router(astroCoord.router, prefix="/astroCoord", tags=["astroCoord"])
app.include_router(moonTime.router, prefix="/moonTime", tags=["moonTime"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
