from pydantic import BaseModel
from typing import Optional
from app.strips.models import LED

from sqlmodel import Field, SQLModel


class Author(BaseModel):
    id: Optional[str] = None
    firstName: str
    lastName: str


class Book(BaseModel):
    id: Optional[str] = None
    title: str
    genre: Optional[str] = None
    isbn: Optional[str] = None
    author: Author


class Box(BaseModel):
    id: Optional[str] = None
    leds: list[LED]
    books: list[Book] = []


class Grid(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    height: Optional[int] = None
    width: Optional[int] = None
