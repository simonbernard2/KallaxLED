from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

import app.grids.models as models
from app.archive.parser import ParsedArchivePublication
from app.db import create_sqlite_engine, resolve_database_path, run_migrations


@dataclass
class BookMatchReason:
    type: str
    label: str
    detail: str | None = None


@dataclass
class BookSearchMatch:
    book: models.LibraryBook
    reasons: list[BookMatchReason]


class GridFileRepo:
    def __init__(self, dir_path: Path) -> None:
        self.dir_path = dir_path
        self.db_path = resolve_database_path(dir_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        run_migrations(self.db_path)
        self.engine = create_sqlite_engine(self.db_path)

    def _grid_statement(self):
        return select(models.Grid).options(selectinload(models.Grid.boxes))  # type: ignore[arg-type]

    def _book_statement(self):
        publication_loader = (
            selectinload(models.LibraryBook.archive_publication)
            .selectinload(models.ArchivePublication.entries)
            .selectinload(models.ArchiveEntry.topic_links)
            .selectinload(models.ArchiveEntryTopicLink.topic)
        )
        return select(models.LibraryBook).options(selectinload(models.LibraryBook.box), publication_loader)  # type: ignore[arg-type]

    def get_grid(self) -> models.Grid | None:
        with Session(self.engine) as session:
            return session.exec(self._grid_statement()).first()

    def delete_grid(self) -> models.Grid | None:
        with Session(self.engine) as session:
            grid = session.exec(select(models.Grid)).first()
            if grid is None:
                return None
            session.delete(grid)
            session.commit()
            return grid

    def get_boxes(self) -> list[models.Box]:
        with Session(self.engine) as session:
            statement = select(models.Box)
            return list(session.exec(statement).all())

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
            return session.exec(self._grid_statement().where(models.Grid.id == grid.id)).one()

    def get_box_by_id(self, box_id: int) -> models.Box | None:
        with Session(self.engine) as session:
            return session.get(models.Box, box_id)

    def get_box_by_coords(self, x: int, y: int) -> models.Box | None:
        with Session(self.engine) as session:
            statement = select(models.Box).where(models.Box.x == x, models.Box.y == y)
            return session.exec(statement).first()

    def update_grid(self, name: str, width: int, height: int) -> models.Grid | None:
        with Session(self.engine) as session:
            grid = session.exec(self._grid_statement()).first()
            if grid is None:
                return None

            grid.name = name
            existing_coords = {(box.x, box.y) for box in grid.boxes}
            removed_boxes = [box for box in grid.boxes if box.x >= width or box.y >= height]
            removed_box_ids = {box.id for box in removed_boxes if box.id is not None}

            if removed_box_ids:
                # Unassign books from removed boxes (and flush) so deleting the boxes does not
                # cascade-delete the books — the shelf resize should keep them, just orphaned.
                removed_books = session.exec(
                    select(models.LibraryBook).where(models.LibraryBook.box_id.in_(removed_box_ids))
                ).all()
                for book in removed_books:
                    book.box_id = None
                    session.add(book)

                state = session.exec(select(models.LightingState)).first()
                if state is not None and state.highlight_box_id in removed_box_ids:
                    state.highlight_box_id = None
                    state.highlight_rgb = None
                    session.add(state)

                session.flush()

                # Delete through the relationship (delete-orphan) so the loaded grid.boxes
                # collection stays consistent; a bulk DELETE leaves stale instances behind and
                # the commit-time cascade then fails with "Instance has been deleted".
                for box in removed_boxes:
                    grid.boxes.remove(box)

            for y in range(height):
                for x in range(width):
                    if (x, y) in existing_coords:
                        continue
                    grid.boxes.append(models.Box(x=x, y=y, leds=[]))

            session.commit()
            return session.exec(self._grid_statement().where(models.Grid.id == grid.id)).one()

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

    def get_book(self, book_id: int) -> models.LibraryBook | None:
        with Session(self.engine) as session:
            return session.exec(self._book_statement().where(models.LibraryBook.id == book_id)).first()

    def create_book(self, book: models.LibraryBook) -> models.LibraryBook:
        if book.id is not None:
            raise Exception("can't create a book with an existing id")
        with Session(self.engine) as session:
            session.add(book)
            session.commit()
            return session.exec(self._book_statement().where(models.LibraryBook.id == book.id)).one()

    def update_book(self, book_id: int, updates: dict) -> models.LibraryBook | None:
        with Session(self.engine) as session:
            book = session.get(models.LibraryBook, book_id)
            if book is None:
                return None
            for key, value in updates.items():
                setattr(book, key, value)
            session.add(book)
            session.commit()
            return session.exec(self._book_statement().where(models.LibraryBook.id == book.id)).one()

    def delete_book(self, book_id: int) -> models.LibraryBook | None:
        with Session(self.engine) as session:
            book = session.exec(self._book_statement().where(models.LibraryBook.id == book_id)).first()
            if book is None:
                return None
            session.delete(session.get(models.LibraryBook, book_id))
            session.commit()
            return book

    def list_books(self) -> list[models.LibraryBook]:
        with Session(self.engine) as session:
            statement = self._book_statement()
            books = list(session.exec(statement).all())
            return sorted(books, key=lambda book: (book.title.lower(), book.author.lower()))

    def list_topics(self, query: str | None = None) -> list[models.MagicTopic]:
        topics: list[models.MagicTopic]
        with Session(self.engine) as session:
            topics = list(session.exec(select(models.MagicTopic)).all())
        if query is None or query.strip() == "":
            return sorted(topics, key=lambda topic: topic.path.lower())

        needle = query.strip().lower()
        return sorted(
            [topic for topic in topics if needle in topic.name.lower() or needle in topic.path.lower()],
            key=lambda topic: topic.path.lower(),
        )

    def search_books(self, query: str | None) -> list[models.LibraryBook]:
        return [result.book for result in self.search_book_matches(query)]

    def search_book_matches(self, query: str | None) -> list[BookSearchMatch]:
        books = self.list_books()
        if query is None or query.strip() == "":
            return [BookSearchMatch(book=book, reasons=[]) for book in books]

        needle = query.strip().lower()
        results: list[BookSearchMatch] = []

        for book in books:
            reasons = self._collect_book_match_reasons(book, needle)
            if reasons:
                results.append(BookSearchMatch(book=book, reasons=reasons))

        return sorted(results, key=lambda result: (-len(result.reasons), result.book.title.lower()))

    def _collect_book_match_reasons(self, book: models.LibraryBook, needle: str) -> list[BookMatchReason]:
        reasons: list[BookMatchReason] = []
        seen: set[tuple[str, str, str | None]] = set()

        def add_reason(reason_type: str, label: str, detail: str | None = None) -> None:
            normalized = (reason_type, label, detail)
            if normalized in seen:
                return
            seen.add(normalized)
            reasons.append(BookMatchReason(type=reason_type, label=label, detail=detail))

        if needle in book.title.lower():
            add_reason("title", book.title)
        if needle in book.author.lower():
            add_reason("author", book.author)
        if book.isbn and needle in book.isbn.lower():
            add_reason("isbn", book.isbn)
        for tag in book.user_tags:
            if needle in tag.lower():
                add_reason("tag", tag)
        if book.notes and needle in book.notes.lower():
            add_reason("note", "Personal notes")

        publication = book.archive_publication
        if publication is None:
            return reasons

        if needle in publication.title.lower():
            add_reason("publication", publication.title)
        for author in publication.authors:
            if needle in author.lower():
                add_reason("publication_author", author, publication.title)

        for entry in publication.entries:
            if needle in entry.title.lower():
                detail = f"p. {entry.page}" if entry.page else publication.title
                add_reason("entry", entry.title, detail)
            for creator in entry.creators:
                if needle in creator.lower():
                    add_reason("entry_creator", creator, entry.title)
            for topic_link in entry.topic_links:
                topic = topic_link.topic
                if topic is None:
                    continue
                if needle in topic.name.lower() or needle in topic.path.lower():
                    add_reason("topic", topic.name, topic.path)

        return reasons[:8]

    def link_book_to_archive(self, book_id: int, publication: ParsedArchivePublication) -> models.LibraryBook | None:
        with Session(self.engine) as session:
            book = session.get(models.LibraryBook, book_id)
            if book is None:
                return None

            record = session.exec(
                select(models.ArchivePublication).where(
                    models.ArchivePublication.external_id == publication.external_id
                )
            ).first()
            if record is None:
                record = models.ArchivePublication(
                    external_id=publication.external_id,
                    source_url=publication.source_url,
                    title=publication.title,
                    subtitle=publication.subtitle,
                    authors=publication.authors,
                )
            else:
                record.source_url = publication.source_url
                record.title = publication.title
                record.subtitle = publication.subtitle
                if publication.authors:
                    record.authors = publication.authors

            session.add(record)
            session.commit()
            session.refresh(record)

            book.archive_publication_id = record.id
            session.add(book)
            session.commit()
            return session.exec(self._book_statement().where(models.LibraryBook.id == book_id)).one()

    def import_archive_publication(
        self,
        book_id: int,
        publication: ParsedArchivePublication,
    ) -> models.LibraryBook | None:
        with Session(self.engine) as session:
            book = session.get(models.LibraryBook, book_id)
            if book is None:
                return None

            record = session.exec(
                select(models.ArchivePublication).where(
                    models.ArchivePublication.external_id == publication.external_id
                )
            ).first()
            if record is None:
                record = models.ArchivePublication(
                    external_id=publication.external_id,
                    source_url=publication.source_url,
                    title=publication.title,
                    subtitle=publication.subtitle,
                    authors=publication.authors,
                )

            record.source_url = publication.source_url
            record.title = publication.title
            record.subtitle = publication.subtitle
            record.authors = publication.authors
            record.imported_at = datetime.now(UTC)
            session.add(record)
            session.commit()
            session.refresh(record)

            book.archive_publication_id = record.id
            session.add(book)
            session.commit()

            existing_entries = list(
                session.exec(select(models.ArchiveEntry).where(models.ArchiveEntry.publication_id == record.id)).all()
            )
            for entry in existing_entries:
                session.delete(entry)
            session.commit()

            topic_cache = {topic.path: topic for topic in session.exec(select(models.MagicTopic)).all()}

            for parsed_entry in publication.entries:
                entry = models.ArchiveEntry(
                    publication_id=record.id,
                    external_id=parsed_entry.external_id,
                    title=parsed_entry.title,
                    page=parsed_entry.page,
                    creators=parsed_entry.creators,
                    summary=parsed_entry.summary,
                )
                session.add(entry)
                session.flush()

                for topic_path in parsed_entry.topic_paths:
                    topic = topic_cache.get(topic_path)
                    if topic is None:
                        parts = [segment.strip() for segment in topic_path.split("/") if segment.strip()]
                        topic = models.MagicTopic(
                            name=parts[-1],
                            path=" / ".join(parts),
                            parent_path=" / ".join(parts[:-1]) if len(parts) > 1 else None,
                        )
                        session.add(topic)
                        session.flush()
                        topic_cache[topic.path] = topic

                    session.add(models.ArchiveEntryTopicLink(entry_id=entry.id, topic_id=topic.id))

            session.commit()
            return session.exec(self._book_statement().where(models.LibraryBook.id == book_id)).one()

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
            session.add(state)
            session.commit()
            session.refresh(state)
            return state

    def clear_highlight(self) -> models.LightingState:
        with Session(self.engine) as session:
            state = self._get_or_create_lighting_state(session)
            state.highlight_box_id = None
            state.highlight_rgb = None
            session.add(state)
            session.commit()
            session.refresh(state)
            return state

    def set_scene(self, name: str | None, params: dict) -> models.LightingState:
        with Session(self.engine) as session:
            state = self._get_or_create_lighting_state(session)
            state.active_scene = name
            state.scene_params = params
            session.add(state)
            session.commit()
            session.refresh(state)
            return state
