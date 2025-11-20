from pydantic import BaseModel


class RGBType(BaseModel):
    red: int
    green: int
    blue: int


class LEDType(BaseModel):
    id: int
    rgb: RGBType


class BoxType(BaseModel):
    id: int
    led_ids: list[int]
    rgb: RGBType


class GridType(BaseModel):
    boxes: list[list[BoxType]]


class ConfigType(BaseModel):
    height: int
    width: int
