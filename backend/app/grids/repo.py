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

    def get_grid(self) -> Optional[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid).options(selectinload(models.Grid.boxes))  # type: ignore
            result = session.exec(statement).first()
            return result

    def delete_grid(self) -> Optional[models.Grid]:
        with Session(self.engine) as session:
            statement = select(models.Grid)
            grid = session.exec(statement).first()
            if grid is None:
                return None
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
            existing = session.exec(select(models.Grid)).first()
            if existing is not None:
                raise Exception("grid already exists")
            session.add(grid)
            session.commit()
            session.refresh(grid)
            statement = select(models.Grid).options(selectinload(models.Grid.boxes)).where(models.Grid.id == grid.id)  # type: ignore
            return session.exec(statement).one()

    def get_box_by_id(self, box_id: int) -> Optional[models.Box]:
        with Session(self.engine) as session:
            return session.get(models.Box, box_id)

    def get_box_by_coords(self, x: int, y: int) -> Optional[models.Box]:
        with Session(self.engine) as session:
            statement = select(models.Box).where(models.Box.x == x, models.Box.y == y)
            return session.exec(statement).first()

    def update_grid_name(self, name: str) -> Optional[models.Grid]:
        with Session(self.engine) as session:
            grid = session.exec(select(models.Grid)).first()
            if grid is None:
                return None
            grid.name = name
            session.add(grid)
            session.commit()
            statement = select(models.Grid).options(selectinload(models.Grid.boxes)).where(models.Grid.id == grid.id)  # type: ignore
            return session.exec(statement).one()

    def update_led_assignments(self, assignments: dict[int, list[int]]) -> None:
        if not assignments:
            return
        with Session(self.engine) as session:
            for box_id, leds in assignments.items():
                box = session.get(models.Box, box_id)
                if box is None:
                    raise Exception(f"missing box id={box_id}")
                box.leds = leds
                session.add(box)
            session.commit()

    def create_book(self, book: models.Book) -> models.Book:
        if book.id is not None:
            raise Exception("can't create a book with an existing id")
        with Session(self.engine) as session:
            session.add(book)
            session.commit()
            statement = select(models.Book).options(selectinload(models.Book.box)).where(models.Book.id == book.id)  # type: ignore
            return session.exec(statement).one()

    def update_book(self, book_id: int, updates: dict) -> Optional[models.Book]:
        with Session(self.engine) as session:
            book = session.get(models.Book, book_id)
            if book is None:
                return None
            for key, value in updates.items():
                setattr(book, key, value)
            session.add(book)
            session.commit()
            statement = select(models.Book).options(selectinload(models.Book.box)).where(models.Book.id == book.id)  # type: ignore
            return session.exec(statement).one()

    def delete_book(self, book_id: int) -> Optional[models.Book]:
        with Session(self.engine) as session:
            book = session.get(models.Book, book_id)
            if book is None:
                return None
            session.delete(book)
            session.commit()
            return book

    def list_books(self) -> list[models.Book]:
        with Session(self.engine) as session:
            statement = select(models.Book).options(selectinload(models.Book.box))  # type: ignore
            return list(session.exec(statement).all())

    def search_books(self, query: Optional[str]) -> list[models.Book]:
        books = self.list_books()
        if query is None or query.strip() == "":
            return books
        needle = query.lower()

        def matches(book: models.Book) -> bool:
            in_title = needle in book.title.lower()
            in_author = needle in book.author.lower()
            in_isbn = book.isbn is not None and needle in book.isbn.lower()
            in_tags = any(needle in tag.lower() for tag in book.tags)
            return in_title or in_author or in_isbn or in_tags

        return [book for book in books if matches(book)]

    def _get_or_create_lighting_state(self, session: Session) -> models.LightingState:
        state = session.exec(select(models.LightingState)).first()
        if state is None:
            state = models.LightingState()
            session.add(state)
            session.commit()
            session.refresh(state)
        return state

    def get_lighting_state(self) -> models.LightingState:
        with Session(self.engine) as session:
            return self._get_or_create_lighting_state(session)

    def set_highlight(self, box_id: int, rgb: list[int]) -> models.LightingState:
        with Session(self.engine) as session:
            state = self._get_or_create_lighting_state(session)
            state.highlight_box_id = box_id
            state.highlight_rgb = rgb
            state.active_scene = None
            state.scene_params = {}
            session.add(state)
            session.commit()
            session.refresh(state)
            return state

    def clear_highlight(self) -> models.LightingState:
        with Session(self.engine) as session:
            state = self._get_or_create_lighting_state(session)
            state.highlight_box_id = None
            state.highlight_rgb = None
            state.active_scene = None
            state.scene_params = {}
            session.add(state)
            session.commit()
            session.refresh(state)
            return state

    #
    # def __save_to_db(self, grid) -> None:
    #     self.grids[grid.id] = grid.model_dump()
    #     self.__update_db_file()
    #
    # def __update_db_file(self) -> None:
    #     self.db_file.write_text(json.dumps(self.grids))
