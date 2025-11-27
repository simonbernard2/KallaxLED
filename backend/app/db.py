import app.base_models as models
from typing import Optional
from pathlib import Path
import json
import uuid


class GridFileRepo:
    def __init__(self, dir_path: Path) -> None:
        self.dir_path = dir_path
        self.dir_path.mkdir(exist_ok=True)
        self.db_file = self.dir_path / "grid.json"
        self.grids = {}
        if self.db_file.exists():
            data = json.loads(self.db_file.read_text())
            self.grids = data

    def get_grids(self) -> list[models.Grid]:
        return [models.Grid.model_validate(grid) for grid in self.grids.values()]

    def get_grid_by_id(self, grid_id: str) -> Optional[models.Grid]:
        if grid_id not in self.grids:
            return None

        return models.Grid.model_validate(self.grids[grid_id])

    def create_grid(self, grid: models.Grid) -> models.Grid:
        if grid.id is not None:
            raise Exception("can't create a grid with an existing id")
        grid.id = str(uuid.uuid4())

        self.__save_to_db(grid)
        return grid

    def update_grid(self, grid: models.Grid) -> models.Grid:
        if grid.id is None:
            raise Exception("missing grid.id")
        if grid.id not in self.grids:
            raise Exception("grid not found")

        self.__save_to_db(grid)
        return grid

    def __save_to_db(self, grid) -> None:
        self.grids[grid.id] = grid.model_dump()
        self.db_file.write_text(json.dumps(self.grids))
