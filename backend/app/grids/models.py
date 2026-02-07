from typing import Optional

from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Column, Field, Relationship, SQLModel


class Box(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    x: int
    y: int
    leds: list[int] = Field(default_factory=list, sa_column=Column(JSON))

    grid_id: Optional[int] = Field(default=None, foreign_key="grid.id")
    grid: Optional["Grid"] = Relationship(back_populates="boxes")
    books: list["Book"] = Relationship(back_populates="box", sa_relationship_kwargs={"cascade": "all, delete"})


class Grid(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    boxes: list[Box] = Relationship(back_populates="grid", cascade_delete=True)


class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author: str
    isbn: Optional[str] = None
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))

    box_id: Optional[int] = Field(default=None, foreign_key="box.id")
    box: Optional[Box] = Relationship(back_populates="books")


class LightingState(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    highlight_box_id: Optional[int] = Field(default=None, foreign_key="box.id")
    highlight_rgb: Optional[list[int]] = Field(default=None, sa_column=Column(JSON))
    active_scene: Optional[str] = None
    scene_params: dict = Field(default_factory=dict, sa_column=Column(JSON))
