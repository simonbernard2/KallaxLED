from typing import Optional

from pydantic import BaseModel


class HighlightRequest(BaseModel):
    box_id: int
    rgb: tuple[int, int, int]


class LightingStateResponse(BaseModel):
    highlight_box_id: Optional[int]
    highlight_rgb: Optional[list[int]]
    active_scene: Optional[str]
    scene_params: dict
