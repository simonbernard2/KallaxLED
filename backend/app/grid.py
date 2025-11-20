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


class ConfigType(BaseModel):
    height: int
    width: int
