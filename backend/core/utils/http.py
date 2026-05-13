import httpx
import asyncio
from config import MAX_CONNECTIONS

limits = httpx.Limits(
    max_connections=MAX_CONNECTIONS,
    max_keepalive_connections=MAX_CONNECTIONS,
)

global_client: httpx.AsyncClient | None = None
client_loop: asyncio.AbstractEventLoop | None = None

def get_http_client() -> httpx.AsyncClient:
    global global_client, client_loop
    current_loop = asyncio.get_running_loop()
    if global_client is None or client_loop is not current_loop:
        global_client = httpx.AsyncClient(limits=limits)
        client_loop = current_loop
    return global_client

async def close_http_client():
    global global_client
    if global_client is not None:
        await global_client.aclose()
        global_client = None
