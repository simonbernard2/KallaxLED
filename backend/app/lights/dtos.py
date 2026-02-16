from typing import Optional

from pydantic import BaseModel, Field


class HighlightRequest(BaseModel):
    box_id: int
    rgb: tuple[int, int, int]


class SceneRequest(BaseModel):
    name: str
    params: dict = Field(default_factory=dict)


class LightingStateResponse(BaseModel):
    highlight_box_id: Optional[int]
    highlight_rgb: Optional[list[int]]
    active_scene: Optional[str]
    scene_params: dict
