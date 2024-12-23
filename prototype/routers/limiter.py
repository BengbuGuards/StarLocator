from slowapi import Limiter
from slowapi.util import get_remote_address
from config import RATE_LIMIT

limiter = Limiter(key_func=get_remote_address, enabled=RATE_LIMIT)
