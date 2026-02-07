from typing import Optional

from pydantic import BaseModel, Field

from app.grids.models import Book, Box


class BoxRef(BaseModel):
    id: int
    x: int
    y: int

    @staticmethod
    def from_box(box: Box) -> "BoxRef":
        if box.id is None:
            raise Exception("no box id")
        return BoxRef(id=box.id, x=box.x, y=box.y)


class BookCreate(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    box_id: Optional[int] = None

    def to_model(self) -> Book:
        return Book(
            title=self.title,
            author=self.author,
            isbn=self.isbn,
            tags=self.tags,
            box_id=self.box_id,
        )


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    tags: Optional[list[str]] = None
    box_id: Optional[int] = None


class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    isbn: Optional[str] = None
    tags: list[str]
    box: Optional[BoxRef] = None

    @staticmethod
    def from_book(book: Book) -> "BookResponse":
        if book.id is None:
            raise Exception("no book id")
        box_ref = BoxRef.from_box(book.box) if book.box is not None else None
        return BookResponse(
            id=book.id,
            title=book.title,
            author=book.author,
            isbn=book.isbn,
            tags=book.tags,
            box=box_ref,
        )


class BookImportResult(BaseModel):
    created: int
    skipped: int
    errors: list[str]
