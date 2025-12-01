from pydantic import BaseModel


class Color(BaseModel):
    rgb: tuple[int, int, int]


class LED(BaseModel):
    id: int
    rgb: tuple[int, int, int]


class StripAnimationStep(BaseModel):
    leds: list[LED]
    delay_ms: int


class StripAnimation(BaseModel):
    steps: list[StripAnimationStep]
