from functools import lru_cache
from app.strips.strip import Strip


@lru_cache
def led_strip() -> Strip:
    return Strip.default()
