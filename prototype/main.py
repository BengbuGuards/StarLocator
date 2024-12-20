from fastapi import FastAPI
from routers import locator, astroCoord

app = FastAPI()


app.include_router(locator.router, prefix="/locator", tags=["locator"])
app.include_router(astroCoord.router, prefix="/astroCoord", tags=["astroCoord"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
