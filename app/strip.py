import board
import neopixel
import math
import time
from typing import Any

RGB = tuple[int, int, int]


class Strip:
    def __init__(self, g_pid, number_of_leds: int, auto_write=False) -> None:
        self.pixels = neopixel.NeoPixel(g_pid, number_of_leds, auto_write=auto_write)

    @staticmethod
    def default() -> "Strip":
        return Strip(board.D18, 150)

    def turn_off(self) -> None:
        self.pixels.fill((0, 0, 0))
        self.pixels.show()

    def transition(self, led_index: int, color: RGB, speed_ms: int = 1000) -> None:
        end_r, end_g, end_b = color
        current_r, current_g, current_b = self.pixels[led_index]

        step_r, min_max_r = self._fade_step(current_r, end_r, speed_ms)
        step_g, min_max_g = self._fade_step(current_g, end_g, speed_ms)
        step_b, min_max_b = self._fade_step(current_b, end_b, speed_ms)
        while not (end_r == current_r and end_g == current_g and end_b == current_b):
            current_r = min_max_r(current_r + step_r, end_r)
            current_g = min_max_g(current_g + step_g, end_g)
            current_b = min_max_b(current_b + step_b, end_b)

            self.pixels[led_index] = (current_r, current_g, current_b)
            self.pixels.show()
            time.sleep(speed_ms / (250 * 1000))

    def _fade_step(
        self, start_value: int, end_value: int, speed_ms: int
    ) -> tuple[int, Any]:
        diff = end_value - start_value
        step = diff / speed_ms
        if diff >= 0:
            return (math.ceil(step), min)
        else:
            return (math.floor(step), max)
