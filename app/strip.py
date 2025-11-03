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

    def transition(
        self, led_indexes: list[int], color: RGB, speed_ms: int = 1000
    ) -> None:
        led_fades = [
            self._fade_rgb(self.pixels[i], color, speed_ms)  # type:ignore
            for i in led_indexes
        ]
        while not self._transition_completed(led_indexes, color):
            for i in range(len(led_fades)):
                self._apply_step_to_led(led_indexes[i], led_fades[i], color)
            self.pixels.show()
            time.sleep(speed_ms / (250 * 1000))

    def transition_single_led(
        self, led_index: int, color: RGB, speed_ms: int = 1000
    ) -> None:
        self.transition([led_index], color, speed_ms)

    def _apply_step_to_led(self, led_index: int, fade: tuple, color: RGB) -> None:
        fade_r, fade_g, fade_b = fade
        end_r, end_g, end_b = color

        current_r, current_g, current_b = self.pixels[led_index]

        step_r, min_max_r = fade_r
        step_g, min_max_g = fade_g
        step_b, min_max_b = fade_b

        current_r = min_max_r(current_r + step_r, end_r)
        current_g = min_max_g(current_g + step_g, end_g)
        current_b = min_max_b(current_b + step_b, end_b)

        self.pixels[led_index] = (current_r, current_g, current_b)

    def _fade_rgb(self, start_color: RGB, end_color: RGB, speed_ms: int) -> tuple:
        return (
            self._fade_color_channel(start_color[0], end_color[0], speed_ms),
            self._fade_color_channel(start_color[1], end_color[1], speed_ms),
            self._fade_color_channel(start_color[2], end_color[2], speed_ms),
        )

    def _fade_color_channel(
        self, start_value: int, end_value: int, speed_ms: int
    ) -> tuple[int, Any]:
        diff = end_value - start_value
        step = diff / speed_ms
        if diff >= 0:
            return (math.ceil(step), min)
        else:
            return (math.floor(step), max)

    def _transition_completed(self, led_indexes: list[int], color: RGB) -> bool:
        return all((self.pixels[i] == list(color) for i in led_indexes))
