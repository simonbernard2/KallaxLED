from app.strips.strip import Strip
from typing import Annotated
from fastapi import Depends
from functools import lru_cache


@lru_cache
def led_strip() -> Strip:
    return Strip.default()


LedStripDep = Annotated[Strip, Depends(led_strip)]
