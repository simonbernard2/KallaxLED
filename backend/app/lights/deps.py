from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from app.lights.engine import AnimationEngine


@lru_cache
def animation_engine() -> AnimationEngine:
    return AnimationEngine()


AnimationEngineDep = Annotated[AnimationEngine, Depends(animation_engine)]
