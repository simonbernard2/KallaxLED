from dataclasses import dataclass
from typing import Optional

import numpy as np

import app.grids.models as models


@dataclass(frozen=True)
class StripGeometry:
    """Per-LED spatial data derived from the grid, aligned on sorted unique LED ids."""

    num_pixels: int
    led_ids: np.ndarray  # (N,) int — sorted unique assigned LED ids
    box_x: np.ndarray  # (N,) int — box x coordinate per LED
    box_y: np.ndarray  # (N,) int — box y coordinate per LED
    pos_x: np.ndarray  # (N,) float — box x normalized to [0, 1]
    frac: np.ndarray  # (N,) float — position along the sorted LED order in [0, 1]


def build_geometry(grid: models.Grid, num_pixels: int) -> Optional[StripGeometry]:
    """Map every assigned LED to its box coordinates.

    Duplicate LED ids keep the first box encountered; ids outside the strip are dropped.
    Returns None when no boxes have LEDs assigned.
    """
    coords: dict[int, tuple[int, int]] = {}
    for box in grid.boxes:
        for led_id in box.leds:
            if 0 <= led_id < num_pixels and led_id not in coords:
                coords[led_id] = (box.x, box.y)
    if not coords:
        return None

    led_ids = np.array(sorted(coords), dtype=np.int64)
    box_x = np.array([coords[int(i)][0] for i in led_ids], dtype=np.int64)
    box_y = np.array([coords[int(i)][1] for i in led_ids], dtype=np.int64)
    max_x = int(box_x.max())
    pos_x = box_x / max_x if max_x > 0 else np.zeros(len(led_ids), dtype=np.float64)
    count = len(led_ids)
    frac = np.arange(count) / (count - 1) if count > 1 else np.zeros(1, dtype=np.float64)
    return StripGeometry(num_pixels=num_pixels, led_ids=led_ids, box_x=box_x, box_y=box_y, pos_x=pos_x, frac=frac)
