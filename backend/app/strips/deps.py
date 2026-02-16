from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from app.strips.strip import Strip


@lru_cache
def led_strip() -> Strip:
    return Strip.default()


LedStripDep = Annotated[Strip, Depends(led_strip)]
