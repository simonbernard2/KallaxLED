from typing import Iterable
import pytest

from app import strip as strip_module
from app.strip import Strip


class FakePixel:
    def __init__(self, _g_pid, number_of_leds, *, auto_write=False):
        self._auto_write = auto_write
        self._data = [(0, 0, 0)] * number_of_leds

    def __len__(self) -> int:
        return len(self._data)

    def __iter__(self) -> Iterable[tuple[int, int, int]]:
        return iter(self._data)

    def __getitem__(self, index):
        return self._data[index]

    def __setitem__(self, index, value):
        self._data[index] = tuple(value)
        if self._auto_write:
            self.show()

    def fill(self, color):
        value = tuple(color)
        self._data = [value] * len(self._data)
        if self._auto_write:
            self.show()

    def show(self):
        pass


@pytest.fixture(autouse=True)
def fast_sleep(monkeypatch):
    monkeypatch.setattr(strip_module.time, "sleep", lambda _seconds: None)


def test_transition_single_led_reaches_target():
    strip = Strip(0, 10, pixel_factory=FakePixel)
    strip.transition_single_led(0, (10, 20, 30), speed_ms=5)

    assert strip.pixels[0] == (10, 20, 30)


def test_bullet_restores_original_state():
    strip = Strip(0, 10, pixel_factory=FakePixel)
    strip.pixels[5] = (255, 255, 255)
    original = list(strip.pixels)

    strip.bullet(range(0, 3), (255, 0, 0), speed_ms=1, width=1)

    assert list(strip.pixels) == original


def test_turn_off_blackout():
    strip = Strip(0, 5, pixel_factory=FakePixel)
    strip.pixels[0] = (10, 10, 10)
    strip.pixels[1] = (20, 0, 0)

    strip.turn_off()

    assert all(color == (0, 0, 0) for color in strip.pixels)
