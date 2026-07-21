import numpy as np

import app.strips.strip as strip_module
from app.strips.stub import neopixel as stub_neopixel


def _stub_strip(monkeypatch, number_of_leds: int) -> strip_module.Strip:
    # Force the in-process stub even on the Pi, where the real neopixel module imports.
    monkeypatch.setattr(strip_module, "neopixel", stub_neopixel)
    return strip_module.Strip(1, number_of_leds)


def test_show_frame_writes_all_pixels(monkeypatch):
    strip = _stub_strip(monkeypatch, 3)
    frame = np.array([[10, 20, 30], [40, 50, 60], [70, 80, 90]], dtype=np.uint8)

    strip.show_frame(frame)

    # Reads report the requested sRGB; the driver itself holds gamma-encoded values.
    assert [led.rgb for led in strip.leds()] == [(10, 20, 30), (40, 50, 60), (70, 80, 90)]


def test_show_frame_casts_numpy_scalars_to_int(monkeypatch):
    strip = _stub_strip(monkeypatch, 1)

    strip.show_frame(np.array([[255, 0, 128]], dtype=np.uint8))

    pixel = strip.pixels[0]
    assert all(type(channel) is int for channel in pixel)
