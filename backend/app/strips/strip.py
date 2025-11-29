import board
import neopixel
from app.strips.models import LED, Color


class Strip:
    """Facade over a NeoPixel strip with helpers for common bookshelf animations."""

    def __init__(
        self,
        g_pid,
        number_of_leds: int,
        auto_write: bool = False,
    ) -> None:
        self.pixels: neopixel.NeoPixel = neopixel.NeoPixel(
            g_pid, number_of_leds, auto_write=auto_write
        )

    @classmethod
    def default(cls, *, number_of_leds: int = 150, auto_write: bool = False) -> "Strip":
        return cls(
            board.D18,
            number_of_leds,
            auto_write=auto_write,
        )

    def turn_off(self) -> None:
        self.pixels.fill((0, 0, 0))
        self.pixels.show()

    def leds(self) -> list[LED]:
        leds = []
        for i in range(len(self.pixels)):
            pixel: tuple[int, int, int] = self.pixels[i]  # type: ignore
            leds.append(LED(id=i, rgb=pixel))
        return leds

    def update_led(self, index: int, color: Color) -> None:
        self.pixels[index] = color.rgb
        self.pixels.show()

    def update_leds(self, leds: list[LED]):
        for led in leds:
            self.pixels[led.id] = led.rgb
        self.pixels.show()
