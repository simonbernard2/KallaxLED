from typing import Optional
from app.strips.models import LED

from sqlmodel import Field, Column, SQLModel
from sqlalchemy.dialects.sqlite import JSON


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
    leds: list[LED] = Field(default_factory=list, sa_column=Column(JSON))
    grid_id: Optional[int] = Field(default=None, foreign_key="grid.id")


class Grid(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    height: Optional[int] = None
    width: Optional[int] = None
