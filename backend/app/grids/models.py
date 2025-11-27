from pydantic import BaseModel
from typing import Optional
from app.strips.models import LED


class Box(BaseModel):
    leds: list[LED]


class Grid(BaseModel):
    id: Optional[str] = None
    name: str
    boxes: list[list[Box]]

