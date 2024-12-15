from fastapi import FastAPI
from routers import locator

app = FastAPI()


app.include_router(locator.router, prefix="/locator", tags=["locator"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
