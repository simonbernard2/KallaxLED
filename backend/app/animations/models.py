from typing import Optional
from pydantic import BaseModel


class BoxEvent(BaseModel):
    i: int
    j: int
    rgb: tuple[int, int, int]


class AnimationStep(BaseModel):
    events: list[BoxEvent]
    delay_ms: int

    @classmethod
    def empty(cls, delay_ms: int) -> "AnimationStep":
        return AnimationStep(events=[], delay_ms=delay_ms)


class Animation(BaseModel):
    id: Optional[str] = None
    grid_id: str
    name: str
    steps: list[AnimationStep]
