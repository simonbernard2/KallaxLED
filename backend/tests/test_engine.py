import time

import numpy as np

from app.grids.models import Box, Grid
from app.lights.animations import build_geometry, checkerboard
from app.lights.engine import AnimationEngine


class FrameRecorder:
    def __init__(self) -> None:
        self.frames: list[np.ndarray] = []

    def show_frame(self, frame: np.ndarray) -> None:
        self.frames.append(np.array(frame, copy=True))


def _geometry():
    grid = Grid(name="test")
    grid.boxes = [Box(x=0, y=0, leds=[1]), Box(x=1, y=0, leds=[3])]
    geometry = build_geometry(grid, num_pixels=5)
    assert geometry is not None
    return geometry


PARAMS = {"color_a": [255, 0, 0], "color_b": [0, 0, 255], "period_s": 0}


def test_start_writes_first_frame_synchronously():
    engine = AnimationEngine()
    strip = FrameRecorder()

    engine.start(strip, _geometry(), checkerboard, PARAMS)
    try:
        assert engine.is_running()
        assert len(strip.frames) >= 1
        first = strip.frames[0]
        assert first.shape == (5, 3)
        np.testing.assert_array_equal(first[1], [255, 0, 0])
        np.testing.assert_array_equal(first[3], [0, 0, 255])
        # Unassigned pixels stay dark.
        np.testing.assert_array_equal(first[[0, 2, 4]], np.zeros((3, 3)))
    finally:
        engine.stop()


def test_loop_renders_frames_until_stopped():
    engine = AnimationEngine()
    strip = FrameRecorder()

    engine.start(strip, _geometry(), checkerboard, PARAMS, fps=100.0)
    time.sleep(0.1)
    engine.stop()

    assert not engine.is_running()
    assert len(strip.frames) >= 3
    rendered = len(strip.frames)
    time.sleep(0.05)
    assert len(strip.frames) == rendered  # nothing renders after stop


def test_stop_is_idempotent():
    engine = AnimationEngine()
    engine.stop()

    strip = FrameRecorder()
    engine.start(strip, _geometry(), checkerboard, PARAMS)
    engine.stop()
    engine.stop()

    assert not engine.is_running()


def test_start_replaces_running_animation():
    engine = AnimationEngine()
    first_strip = FrameRecorder()
    second_strip = FrameRecorder()

    engine.start(first_strip, _geometry(), checkerboard, PARAMS, fps=100.0)
    engine.start(second_strip, _geometry(), checkerboard, PARAMS, fps=100.0)
    try:
        rendered = len(first_strip.frames)
        time.sleep(0.05)
        assert len(first_strip.frames) == rendered  # first loop stopped
        assert engine.is_running()
    finally:
        engine.stop()
