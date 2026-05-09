import httpx
from fastapi import APIRouter, Query, Request, Response
import re

from config import BACKEND_API_BASEURL, BMAP_API_KEY

router = APIRouter()

# Define the base URL for the Baidu Map API
BMAP_API_BASEURL = "https://api.map.baidu.com"
PROXY_URL = f"{BACKEND_API_BASEURL}/_BMapService"


@router.api_route("{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def bmap_service_proxy(path: str, request: Request, ak: str = Query(None)):
    params = dict(request.query_params)
    # Add the ak parameter if it's not provided in the query string
    if not ak:
        params["ak"] = BMAP_API_KEY

    # Set the custom header
    headers = dict(request.headers)
    headers["X-Forwarded-Host"] = headers["host"]
    headers.pop("host", None)
    headers.pop("connection", None)
    headers["BMAP_PROXY_URL"] = PROXY_URL

    # Forward the request to the target server
    async with httpx.AsyncClient() as client:
        # 流式传输
        async with client.stream(
            method=request.method,
            url=f"{BMAP_API_BASEURL}{path}",
            headers=headers,
            params=params,
            content=await request.body() if request.method in ["POST", "PUT"] else None,
        ) as response:
            raw_cookies = response.headers.get_list("set-cookie")
            new_cookies = []
            for c in raw_cookies:
                if "domain=" in c.lower():
                    c = re.sub(r"(?i)domain=.*?(;|$)", "", c)
                new_cookies.append(c)

            out_headers = dict(response.headers)
            out_headers.pop("content-encoding", None)
            if len(new_cookies) > 0:
                out_headers["set-cookie"] = "; ".join(new_cookies)

            content_chunks = []
            async for chunk in response.aiter_bytes():
                content_chunks.append(chunk)

            return Response(
                content=b"".join(content_chunks),
                status_code=response.status_code,
                headers=out_headers,
            )
