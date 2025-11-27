from pydantic import BaseModel
from typing import Optional


class Color(BaseModel):
    rgb: tuple[int, int, int]


class LED(BaseModel):
    id: int
    rgb: tuple[int, int, int]


class Box(BaseModel):
    leds: list[LED]


class Grid(BaseModel):
    id: Optional[str] = None
    name: str
    boxes: list[list[Box]]

