import numpy as np

from app.grids.models import Box, Grid
from app.lights.animations import build_geometry


def _grid(boxes: list[Box]) -> Grid:
    grid = Grid(name="test")
    grid.boxes = boxes
    return grid


def test_build_geometry_sorts_and_aligns_coordinates():
    grid = _grid(
        [
            Box(x=1, y=0, leds=[5, 4]),
            Box(x=0, y=1, leds=[0, 2]),
        ]
    )

    geometry = build_geometry(grid, num_pixels=10)

    assert geometry is not None
    assert geometry.num_pixels == 10
    np.testing.assert_array_equal(geometry.led_ids, [0, 2, 4, 5])
    np.testing.assert_array_equal(geometry.box_x, [0, 0, 1, 1])
    np.testing.assert_array_equal(geometry.box_y, [1, 1, 0, 0])
    np.testing.assert_allclose(geometry.pos_x, [0.0, 0.0, 1.0, 1.0])
    np.testing.assert_allclose(geometry.frac, [0.0, 1 / 3, 2 / 3, 1.0])


def test_build_geometry_dedupes_and_drops_out_of_range_ids():
    grid = _grid(
        [
            Box(x=0, y=0, leds=[1, 99, -1]),
            Box(x=1, y=0, leds=[1]),  # duplicate id: first box wins
        ]
    )

    geometry = build_geometry(grid, num_pixels=10)

    assert geometry is not None
    np.testing.assert_array_equal(geometry.led_ids, [1])
    np.testing.assert_array_equal(geometry.box_x, [0])


def test_build_geometry_returns_none_without_assigned_leds():
    assert build_geometry(_grid([]), num_pixels=10) is None
    assert build_geometry(_grid([Box(x=0, y=0, leds=[])]), num_pixels=10) is None


def test_build_geometry_single_box_normalizes_to_zero():
    geometry = build_geometry(_grid([Box(x=0, y=0, leds=[3])]), num_pixels=10)

    assert geometry is not None
    np.testing.assert_allclose(geometry.pos_x, [0.0])
    np.testing.assert_allclose(geometry.frac, [0.0])
