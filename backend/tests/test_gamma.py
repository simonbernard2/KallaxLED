import numpy as np

import app.strips.strip as strip_module
from app.strips.models import Color
from app.strips.stub import neopixel as stub_neopixel


def _stub_strip(monkeypatch, number_of_leds: int) -> strip_module.Strip:
    # Force the in-process stub even on the Pi, where the real neopixel module imports.
    monkeypatch.setattr(strip_module, "neopixel", stub_neopixel)
    return strip_module.Strip(1, number_of_leds)


def test_gamma_lut_preserves_endpoints():
    assert strip_module._GAMMA_LUT[0] == 0
    assert strip_module._GAMMA_LUT[255] == 255


def test_gamma_lut_darkens_midtones():
    # A mid sRGB value must drive the strip well below half power, or it reads washed out.
    assert strip_module._GAMMA_LUT[128] < 64
    # The curve is monotonic, so ordering picked colors never inverts on the strip.
    assert np.all(np.diff(strip_module._GAMMA_LUT.astype(int)) >= 0)


def test_update_leds_by_ids_encodes_for_driver(monkeypatch):
    strip = _stub_strip(monkeypatch, 4)

    strip.update_leds_by_ids([1, 2], (255, 128, 0))

    assert strip.pixels[1] == (255, int(strip_module._GAMMA_LUT[128]), 0)
    assert strip.pixels[3] == (0, 0, 0)


def test_leds_round_trips_requested_srgb(monkeypatch):
    strip = _stub_strip(monkeypatch, 3)

    strip.update_led(0, Color(rgb=(200, 100, 50)))
    strip.update_leds_by_ids([2], (12, 34, 56))

    by_id = {led.id: led.rgb for led in strip.leds()}
    assert by_id[0] == (200, 100, 50)
    assert by_id[1] == (0, 0, 0)
    assert by_id[2] == (12, 34, 56)


def test_turn_off_clears_reported_state(monkeypatch):
    strip = _stub_strip(monkeypatch, 2)
    strip.update_leds_by_ids([0, 1], (255, 255, 255))

    strip.turn_off()

    assert [led.rgb for led in strip.leds()] == [(0, 0, 0), (0, 0, 0)]
