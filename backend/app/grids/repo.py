import app.grids.models as models
from typing import Optional
from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session, select


class GridFileRepo:
    def __init__(self, dir_path: Path) -> None:
        self.dir_path = dir_path
        self.dir_path.mkdir(exist_ok=True)
        self.sqlite_file_name = "database.db"
        self.sqlite_url = f"sqlite:///{self.sqlite_file_name}"
        self.engine = create_engine(self.sqlite_url, echo=True)

        SQLModel.metadata.create_all(self.engine)

    def get_grids(self) -> list[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid)
            results = session.exec(statement)
            return list(results.all())

    def get_grid_by_id(self, grid_id: int) -> Optional[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid).where(models.Grid.id == grid_id)
            results = session.exec(statement)

            return results.first()

    def delete_grid(self, grid_id: int) -> Optional[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid).where(models.Grid.id == grid_id)
            grid = session.exec(statement).one()
            session.delete(grid)
            session.commit()
            return grid

    def create_grid(self, grid: models.Grid) -> models.Grid:
        if grid.id is not None:
            raise Exception("can't create a grid with an existing id")

        with Session(self.engine) as session:
            session.add(grid)
            session.commit()
            session.refresh(grid)
            return grid

    # def update_grid(self, grid: models.Grid) -> models.Grid:
    #     if grid.id is None:
    #         raise Exception("missing grid.id")
    #     if grid.id not in self.grids:
    #         raise Exception("grid not found")
    #
    #     self.__save_to_db(grid)
    #     return grid
    #
    # def __save_to_db(self, grid) -> None:
    #     self.grids[grid.id] = grid.model_dump()
    #     self.__update_db_file()
    #
    # def __update_db_file(self) -> None:
    #     self.db_file.write_text(json.dumps(self.grids))
