import board
import neopixel
import math


class Strip:
    def __init__(self, g_pid, number_of_leds: int, auto_write=False) -> None:
        self.pixels = neopixel.NeoPixel(g_pid, number_of_leds, auto_write=auto_write)

    @staticmethod
    def default() -> "Strip":
        return Strip(board.D18, 150)

    def turn_off(self) -> None:
        self.pixels.fill((0, 0, 0))
        self.pixels.show()

    def fade_in(
        self, led_index: int, color: tuple[int, int, int], speed_ms: int = 1000
    ) -> None:
        end_r, end_g, end_b = color
        current_r, current_g, current_b = [0, 0, 0]
        fade_r = math.ceil(end_r / speed_ms)
        fade_g = math.ceil(end_g / speed_ms)
        fade_b = math.ceil(end_b / speed_ms)
        print(fade_r)
        while not (end_r == current_r and end_g == current_g and end_b == current_b):
            current_r = min(current_r + fade_r, end_r)
            current_g = min(current_g + fade_g, end_g)
            current_b = min(current_b + fade_b, end_b)

            self.pixels[led_index] = (current_r, current_g, current_b)
            self.pixels.show()
