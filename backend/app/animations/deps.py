from app.grids.deps import grid_repo
from app.strips.deps import strip_service
from app.animations.services import AnimationService
from functools import lru_cache


@lru_cache
def animation_service() -> AnimationService:
    return AnimationService(grid_repo(), strip_service())
