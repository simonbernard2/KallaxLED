from typing import Literal

from pydantic import BaseModel, Field


class HighlightRequest(BaseModel):
    box_id: int
    rgb: tuple[int, int, int]


class SceneRequest(BaseModel):
    name: str
    params: dict = Field(default_factory=dict)


class CheckerboardParams(BaseModel):
    color_a: tuple[int, int, int]
    color_b: tuple[int, int, int]
    period_s: float = 1.0  # <= 0 renders a static checkerboard


class RainbowParams(BaseModel):
    speed: float = 0.1  # hue cycles per second
    scale: float = 1.0  # spatial hue cycles across the shelf


class SwipeParams(BaseModel):
    rgb: tuple[int, int, int]
    background_rgb: tuple[int, int, int] = (0, 0, 0)
    speed: float = 0.5  # sweeps per second
    width: float = 0.3  # band width as fraction of the shelf
    direction: Literal["right", "left"] = "right"


ANIMATION_PARAM_MODELS: dict[str, type[BaseModel]] = {
    "checkerboard": CheckerboardParams,
    "rainbow": RainbowParams,
    "swipe": SwipeParams,
}


class LightingStateResponse(BaseModel):
    highlight_box_id: int | None
    highlight_rgb: list[int] | None
    active_scene: str | None
    scene_params: dict
