from pathlib import Path
from typing import Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, SQLModel, create_engine, select

import app.grids.models as models


class GridFileRepo:
    def __init__(self, dir_path: Path) -> None:
        self.dir_path = dir_path
        self.dir_path.mkdir(exist_ok=True)
        self.sqlite_file_name = "database.db"
        self.sqlite_url = f"sqlite:///{self.sqlite_file_name}"
        self.engine = create_engine(self.sqlite_url, echo=True)

        SQLModel.metadata.create_all(self.engine)  # TODO: Move this out of the way to a migration.

    def get_grids(self) -> list[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid)
            results = session.exec(statement)

            return list(results.all())

    def get_grid_by_id(self, grid_id: int) -> Optional[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid).options(selectinload(models.Grid.boxes)).where(models.Grid.id == grid_id)  # type: ignore
            result = session.exec(statement).one()

            return result

    def delete_grid(self, grid_id: int) -> Optional[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid).where(models.Grid.id == grid_id)
            grid = session.exec(statement).one()
            session.delete(grid)
            session.commit()

            return grid

    def get_boxes(self) -> list[models.Box]:
        with Session(self.engine) as session:
            statement = select(models.Box)
            results = session.exec(statement)

            return list(results.all())

    def create_grid(self, grid: models.Grid) -> models.Grid:
        if grid.id is not None:
            raise Exception("can't create a grid with an existing id")

        with Session(self.engine) as session:
            session.add(grid)
            session.commit()
            session.refresh(grid)

            return grid

    def update_box(self, box_data: models.Box) -> models.Box:
        if box_data.id is None:
            raise Exception("missing box.id")

        with Session(self.engine) as session:
            statement = select(models.Box).where(models.Box.id == box_data.id)
            results = session.exec(statement)
            box_db = results.one()
            box_db.sqlmodel_update(box_data)
            session.commit()
            session.refresh(box_db)
            return box_db

    def update_grid(
        self,
        grid_data: models.Grid,
    ) -> models.Grid:
        if grid_data.id is None:
            raise Exception("missing grid.id")

        with Session(self.engine) as session:
            statement = select(models.Grid).where(models.Grid.id == grid_data.id)

            grid = session.exec(statement).one()
            grid.name = grid_data.name

            session.add(grid)
            session.commit()
            session.refresh(grid)

            return grid

    #
    # def __save_to_db(self, grid) -> None:
    #     self.grids[grid.id] = grid.model_dump()
    #     self.__update_db_file()
    #
    # def __update_db_file(self) -> None:
    #     self.db_file.write_text(json.dumps(self.grids))
