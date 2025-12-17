from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from app.grids.repo import GridFileRepo


@lru_cache
def grid_repo() -> GridFileRepo:
    return GridFileRepo(Path("db"))


GridsRepoDep = Annotated[GridFileRepo, Depends(grid_repo)]
