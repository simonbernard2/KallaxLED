from typing import Literal

from pydantic import BaseModel, Field

from app.strips.models import RGB


class HighlightRequest(BaseModel):
    box_id: int
    rgb: RGB


class SceneRequest(BaseModel):
    name: str
    params: dict = Field(default_factory=dict)


class SolidParams(BaseModel):
    rgb: RGB


class CheckerboardParams(BaseModel):
    color_a: RGB
    color_b: RGB
    period_s: float = 1.0  # <= 0 renders a static checkerboard


class RainbowParams(BaseModel):
    speed: float = 0.1  # hue cycles per second
    scale: float = 1.0  # spatial hue cycles across the shelf


class SwipeParams(BaseModel):
    rgb: RGB
    background_rgb: RGB = (0, 0, 0)
    speed: float = 0.5  # sweeps per second
    width: float = 0.3  # band width as fraction of the shelf
    direction: Literal["right", "left"] = "right"


ANIMATION_PARAM_MODELS: dict[str, type[BaseModel]] = {
    "checkerboard": CheckerboardParams,
    "rainbow": RainbowParams,
    "swipe": SwipeParams,
}

# `solid` is not an animation — it has no render function in ANIMATIONS and never reaches the
# engine — but its params still need validating on the way in and on the way back out of the DB.
# Keep the animation map animation-only so it stays paired with ANIMATIONS, and validate against
# this wider map instead.
SCENE_PARAM_MODELS: dict[str, type[BaseModel]] = {"solid": SolidParams, **ANIMATION_PARAM_MODELS}


class LightingStateResponse(BaseModel):
    highlight_box_id: int | None
    highlight_rgb: list[int] | None
    active_scene: str | None
    scene_params: dict
