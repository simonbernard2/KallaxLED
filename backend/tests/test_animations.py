import numpy as np

from app.grids.models import Box, Grid
from app.lights.animations import ANIMATIONS, _hsv_to_rgb, build_geometry, checkerboard, rainbow, swipe


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


def _checker_geometry():
    # Four boxes in a 2x2 grid, one LED each: parities 0, 1, 1, 0.
    grid = _grid(
        [
            Box(x=0, y=0, leds=[0]),
            Box(x=1, y=0, leds=[1]),
            Box(x=0, y=1, leds=[2]),
            Box(x=1, y=1, leds=[3]),
        ]
    )
    geometry = build_geometry(grid, num_pixels=4)
    assert geometry is not None
    return geometry


RED = [255, 0, 0]
BLUE = [0, 0, 255]


def test_checkerboard_colors_by_box_parity():
    frame = checkerboard(_checker_geometry(), 0.0, {"color_a": RED, "color_b": BLUE})

    assert frame.shape == (4, 3)
    assert frame.dtype == np.uint8
    np.testing.assert_array_equal(frame, [RED, BLUE, BLUE, RED])


def test_checkerboard_swaps_colors_every_period():
    geometry = _checker_geometry()
    params = {"color_a": RED, "color_b": BLUE, "period_s": 2.0}

    np.testing.assert_array_equal(checkerboard(geometry, 2.5, params), [BLUE, RED, RED, BLUE])
    np.testing.assert_array_equal(checkerboard(geometry, 4.1, params), [RED, BLUE, BLUE, RED])


def test_checkerboard_static_when_period_is_zero():
    geometry = _checker_geometry()
    params = {"color_a": RED, "color_b": BLUE, "period_s": 0}

    np.testing.assert_array_equal(checkerboard(geometry, 123.4, params), checkerboard(geometry, 0.0, params))


def test_animations_registry_contains_all_scenes():
    assert ANIMATIONS == {"checkerboard": checkerboard, "rainbow": rainbow, "swipe": swipe}


def test_hsv_to_rgb_primaries():
    frame = _hsv_to_rgb(np.array([0.0, 1 / 3, 2 / 3]))

    np.testing.assert_array_equal(frame, [[255, 0, 0], [0, 255, 0], [0, 0, 255]])


def _row_geometry():
    # Four boxes in a single row, one LED each: pos_x = frac spread over [0, 1].
    grid = _grid([Box(x=i, y=0, leds=[i]) for i in range(4)])
    geometry = build_geometry(grid, num_pixels=4)
    assert geometry is not None
    return geometry


def test_rainbow_shape_dtype_and_gradient():
    frame = rainbow(_row_geometry(), 0.0, {"speed": 0.1, "scale": 1.0})

    assert frame.shape == (4, 3)
    assert frame.dtype == np.uint8
    # frac 0 -> red, frac 1/3 -> green, frac 2/3 -> blue
    np.testing.assert_array_equal(frame[0], [255, 0, 0])
    np.testing.assert_array_equal(frame[1], [0, 255, 0])
    np.testing.assert_array_equal(frame[2], [0, 0, 255])


def test_rainbow_is_periodic_in_time():
    geometry = _row_geometry()
    params = {"speed": 0.5, "scale": 1.0}

    np.testing.assert_array_equal(rainbow(geometry, 0.0, params), rainbow(geometry, 2.0, params))


def test_swipe_band_moves_right():
    geometry = _row_geometry()
    params = {"rgb": RED, "background_rgb": BLUE, "speed": 1.0, "width": 0.4}

    # t=0: head at 0, only pos_x == 0 lit.
    np.testing.assert_array_equal(swipe(geometry, 0.0, params), [RED, BLUE, BLUE, BLUE])
    # t=1: head at 1.0, band covers pos in [0.6, 1.0].
    np.testing.assert_array_equal(swipe(geometry, 1.0, params), [BLUE, BLUE, RED, RED])


def test_swipe_direction_left_mirrors_right():
    geometry = _row_geometry()
    base = {"rgb": RED, "background_rgb": BLUE, "speed": 1.0, "width": 0.4}

    right = swipe(geometry, 1.0, {**base, "direction": "right"})
    left = swipe(geometry, 1.0, {**base, "direction": "left"})

    np.testing.assert_array_equal(left, right[::-1])
