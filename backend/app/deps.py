from app.db import GridFileRepo
from pathlib import Path
from functools import lru_cache
from app.strip import Strip


@lru_cache
def grid_repo() -> GridFileRepo:
    return GridFileRepo(Path("db"))


@lru_cache
def led_strip() -> Strip:
    return Strip.default()
