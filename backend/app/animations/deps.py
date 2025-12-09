from pathlib import Path
from typing import Annotated

from fastapi import Depends
from app.grids.deps import grid_repo
from app.strips.deps import strip_service
from app.animations.services import AnimationService
from functools import lru_cache

from app.animations.repo import AnimationFileRepo


@lru_cache
def animation_repo() -> AnimationFileRepo:
    return AnimationFileRepo(Path("db"), grid_repo())


@lru_cache
def animation_service() -> AnimationService:
    return AnimationService(animation_repo(), grid_repo(), strip_service())


AnimationServiceDep = Annotated[AnimationService, Depends(animation_service)]
