from typing import Optional

from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Column, Field, Relationship, SQLModel


class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str


class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    genre: Optional[str] = None
    isbn: Optional[str] = None

    author_id: Optional[int] = Field(default=None, foreign_key="author.id")
    box_id: Optional[int] = Field(default=None, foreign_key="box.id")


class Box(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    x: int
    y: int
    leds: list[int] = Field(default_factory=list, sa_column=Column(JSON))

    grid_id: Optional[int] = Field(default=None, foreign_key="grid.id")
    grid: Optional["Grid"] = Relationship(back_populates="boxes")


class Grid(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    boxes: list[Box] = Relationship(back_populates="grid", cascade_delete=True)
