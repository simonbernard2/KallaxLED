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


def rainbow(geometry: StripGeometry, t: float, params: dict) -> np.ndarray:
    speed = float(params.get("speed", 0.1))  # hue cycles per second
    scale = float(params.get("scale", 1.0))  # spatial hue cycles across the strip
    hue = (geometry.frac * scale + t * speed) % 1.0
    return _hsv_to_rgb(hue)


def swipe(geometry: StripGeometry, t: float, params: dict) -> np.ndarray:
    rgb = np.array(params.get("rgb", (255, 255, 255)), dtype=np.uint8)
    background = np.array(params.get("background_rgb", (0, 0, 0)), dtype=np.uint8)
    speed = float(params.get("speed", 0.5))  # sweeps per second
    width = float(params.get("width", 0.3))  # band width as fraction of the shelf
    direction = params.get("direction", "right")
    pos = geometry.pos_x if direction == "right" else 1.0 - geometry.pos_x
    head = (t * speed) % (1.0 + width)
    lit = (pos >= head - width) & (pos <= head)
    return np.where(lit[:, None], rgb, background)


def _hsv_to_rgb(hue: np.ndarray) -> np.ndarray:
    """Vectorized hue -> (N, 3) uint8 with full saturation and value."""
    h = (hue % 1.0) * 6.0
    sector = h.astype(np.int64) % 6
    f = h - np.floor(h)
    rising = (f * 255).astype(np.uint8)
    falling = ((1.0 - f) * 255).astype(np.uint8)
    full = np.full_like(rising, 255)
    zero = np.zeros_like(rising)
    r = np.choose(sector, [full, falling, zero, zero, rising, full])
    g = np.choose(sector, [rising, full, full, falling, zero, zero])
    b = np.choose(sector, [zero, zero, rising, full, full, falling])
    return np.stack([r, g, b], axis=1)


ANIMATIONS: dict[str, AnimationFn] = {"checkerboard": checkerboard, "rainbow": rainbow, "swipe": swipe}
