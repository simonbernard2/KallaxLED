from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Column, Field, Relationship, SQLModel


class Box(SQLModel, table=True):
    __tablename__ = "box"

    id: Optional[int] = Field(default=None, primary_key=True)
    x: int
    y: int
    leds: list[int] = Field(default_factory=list, sa_column=Column(JSON))

    grid_id: Optional[int] = Field(default=None, foreign_key="grid.id")
    grid: Optional["Grid"] = Relationship(back_populates="boxes")
    books: list["LibraryBook"] = Relationship(back_populates="box", sa_relationship_kwargs={"cascade": "all, delete"})


class Grid(SQLModel, table=True):
    __tablename__ = "grid"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    boxes: list[Box] = Relationship(back_populates="grid", cascade_delete=True)


class ArchivePublication(SQLModel, table=True):
    __tablename__ = "archive_publications"

    id: Optional[int] = Field(default=None, primary_key=True)
    external_id: str = Field(index=True, unique=True)
    source_url: str
    title: str
    subtitle: Optional[str] = None
    authors: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    imported_at: Optional[datetime] = None

    library_books: list["LibraryBook"] = Relationship(back_populates="archive_publication")
    entries: list["ArchiveEntry"] = Relationship(
        back_populates="publication",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class LibraryBook(SQLModel, table=True):
    __tablename__ = "library_books"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author: str
    isbn: Optional[str] = None
    user_tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    notes: Optional[str] = None

    box_id: Optional[int] = Field(default=None, foreign_key="box.id")
    archive_publication_id: Optional[int] = Field(default=None, foreign_key="archive_publications.id")

    box: Optional[Box] = Relationship(back_populates="books")
    archive_publication: Optional[ArchivePublication] = Relationship(back_populates="library_books")


class ArchiveEntry(SQLModel, table=True):
    __tablename__ = "archive_entries"

    id: Optional[int] = Field(default=None, primary_key=True)
    publication_id: int = Field(foreign_key="archive_publications.id", index=True)
    external_id: Optional[str] = Field(default=None, index=True)
    title: str
    page: Optional[str] = None
    creators: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    summary: Optional[str] = None

    publication: Optional[ArchivePublication] = Relationship(back_populates="entries")
    topic_links: list["ArchiveEntryTopicLink"] = Relationship(
        back_populates="entry",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class MagicTopic(SQLModel, table=True):
    __tablename__ = "magic_topics"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    path: str = Field(index=True, unique=True)
    parent_path: Optional[str] = None

    entry_links: list["ArchiveEntryTopicLink"] = Relationship(back_populates="topic")


class ArchiveEntryTopicLink(SQLModel, table=True):
    __tablename__ = "archive_entry_topic_links"

    id: Optional[int] = Field(default=None, primary_key=True)
    entry_id: int = Field(foreign_key="archive_entries.id", index=True)
    topic_id: int = Field(foreign_key="magic_topics.id", index=True)

    entry: Optional[ArchiveEntry] = Relationship(back_populates="topic_links")
    topic: Optional[MagicTopic] = Relationship(back_populates="entry_links")


class LightingState(SQLModel, table=True):
    __tablename__ = "lightingstate"

    id: Optional[int] = Field(default=None, primary_key=True)
    highlight_box_id: Optional[int] = Field(default=None, foreign_key="box.id")
    highlight_rgb: Optional[list[int]] = Field(default=None, sa_column=Column(JSON))
    active_scene: Optional[str] = None
    scene_params: dict = Field(default_factory=dict, sa_column=Column(JSON))


Book = LibraryBook
