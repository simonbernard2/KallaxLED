from dataclasses import dataclass
from typing import Callable, Optional

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


# An animation is a pure function of (geometry, elapsed seconds, params) returning
# (N, 3) uint8 colors aligned with geometry.led_ids.
AnimationFn = Callable[[StripGeometry, float, dict], np.ndarray]


def checkerboard(geometry: StripGeometry, t: float, params: dict) -> np.ndarray:
    color_a = np.array(params.get("color_a", (255, 255, 255)), dtype=np.uint8)
    color_b = np.array(params.get("color_b", (0, 0, 0)), dtype=np.uint8)
    period_s = float(params.get("period_s", 1.0))
    phase = int(t // period_s) if period_s > 0 else 0
    parity = (geometry.box_x + geometry.box_y + phase) % 2
    return np.where(parity[:, None] == 0, color_a, color_b)


ANIMATIONS: dict[str, AnimationFn] = {"checkerboard": checkerboard}
