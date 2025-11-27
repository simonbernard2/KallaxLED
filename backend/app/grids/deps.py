from app.grids.repo import GridFileRepo
from pathlib import Path
from functools import lru_cache
from fastapi import Depends
from typing import Annotated


@lru_cache
def grid_repo() -> GridFileRepo:
    return GridFileRepo(Path("db"))


GridsRepoDep = Annotated[GridFileRepo, Depends(grid_repo)]
