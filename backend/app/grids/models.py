from datetime import datetime

from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Column, Field, Relationship, SQLModel


class Box(SQLModel, table=True):
    __tablename__ = "box"

    id: int | None = Field(default=None, primary_key=True)
    x: int
    y: int
    leds: list[int] = Field(default_factory=list, sa_column=Column(JSON))

    grid_id: int | None = Field(default=None, foreign_key="grid.id")
    grid: "Grid" = Relationship(back_populates="boxes")
    books: list["LibraryBook"] = Relationship(back_populates="box", sa_relationship_kwargs={"cascade": "all, delete"})


class Grid(SQLModel, table=True):
    __tablename__ = "grid"

    id: int | None = Field(default=None, primary_key=True)
    name: str

    boxes: list[Box] = Relationship(back_populates="grid", cascade_delete=True)


class ArchivePublication(SQLModel, table=True):
    __tablename__ = "archive_publications"

    id: int | None = Field(default=None, primary_key=True)
    external_id: str = Field(index=True, unique=True)
    source_url: str
    title: str
    subtitle: str | None = None
    authors: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    imported_at: datetime | None = None

    library_books: list["LibraryBook"] = Relationship(back_populates="archive_publication")
    entries: list["ArchiveEntry"] = Relationship(
        back_populates="publication",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class LibraryBook(SQLModel, table=True):
    __tablename__ = "library_books"

    id: int | None = Field(default=None, primary_key=True)
    title: str
    author: str
    isbn: str | None = None
    user_tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    notes: str | None = None

    box_id: int | None = Field(default=None, foreign_key="box.id")
    archive_publication_id: int | None = Field(default=None, foreign_key="archive_publications.id")

    box: Box = Relationship(back_populates="books")
    archive_publication: ArchivePublication = Relationship(back_populates="library_books")


class ArchiveEntry(SQLModel, table=True):
    __tablename__ = "archive_entries"

    id: int | None = Field(default=None, primary_key=True)
    publication_id: int = Field(foreign_key="archive_publications.id", index=True)
    external_id: str | None = Field(default=None, index=True)
    title: str
    page: str | None = None
    creators: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    summary: str | None = None

    publication: ArchivePublication = Relationship(back_populates="entries")
    topic_links: list["ArchiveEntryTopicLink"] = Relationship(
        back_populates="entry",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class MagicTopic(SQLModel, table=True):
    __tablename__ = "magic_topics"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    path: str = Field(index=True, unique=True)
    parent_path: str | None = None

    entry_links: list["ArchiveEntryTopicLink"] = Relationship(back_populates="topic")


class ArchiveEntryTopicLink(SQLModel, table=True):
    __tablename__ = "archive_entry_topic_links"

    id: int | None = Field(default=None, primary_key=True)
    entry_id: int = Field(foreign_key="archive_entries.id", index=True)
    topic_id: int = Field(foreign_key="magic_topics.id", index=True)

    entry: ArchiveEntry = Relationship(back_populates="topic_links")
    topic: MagicTopic = Relationship(back_populates="entry_links")


class LightingState(SQLModel, table=True):
    __tablename__ = "lightingstate"

    id: int | None = Field(default=None, primary_key=True)
    highlight_box_id: int | None = Field(default=None, foreign_key="box.id")
    highlight_rgb: list[int] | None = Field(default=None, sa_column=Column(JSON))
    active_scene: str | None = None
    scene_params: dict = Field(default_factory=dict, sa_column=Column(JSON))


Book = LibraryBook
