from app.strips.strip import Strip
from app.strips.services import StripService
from typing import Annotated
from fastapi import Depends
from functools import lru_cache


@lru_cache
def led_strip() -> Strip:
    return Strip.default()


@lru_cache
def strip_service() -> StripService:
    return StripService(led_strip())


LedStripDep = Annotated[Strip, Depends(led_strip)]
