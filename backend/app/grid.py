from pydantic import BaseModel


class RGBType(BaseModel):
    red: int
    green: int
    blue: int


class BoxType(BaseModel):
    id: int
    rgb: RGBType


class GridType(BaseModel):
    height: int
    width: int
    boxes: list[BoxType]


class Grid:
    def __init__(self, *, width: int, height: int, boxes: list[BoxType]) -> None:
        self.width = width
        self.height = height
        self.boxes = boxes


colors = RGBType(red=0, green=0, blue=0)
