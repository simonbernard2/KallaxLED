from pydantic import BaseModel
from typing import Optional
from app.strips.models import LED


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


class Grid(BaseModel):
    id: Optional[str] = None
    name: str
    boxes: list[list[Box]]
