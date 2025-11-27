from pydantic import BaseModel


class Color(BaseModel):
    rgb: tuple[int, int, int]


class LED(BaseModel):
    id: int
    rgb: tuple[int, int, int]
