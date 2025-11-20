import board
import neopixel
from app.base_models import GridType, RGBType, LEDType


class Strip:
    """Facade over a NeoPixel strip with helpers for common bookshelf animations."""

    def __init__(
        self,
        g_pid,
        number_of_leds: int,
        auto_write: bool = False,
    ) -> None:
        self.pixels = neopixel.NeoPixel(g_pid, number_of_leds, auto_write=auto_write)

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

    def leds(self) -> list[LEDType]:
        leds = []
        for i in range(len(self.pixels)):
            pixel = self.pixels[i]
            rgb = RGBType(red=pixel[0], green=pixel[1], blue=pixel[2])
            leds.append(LEDType(id=i, rgb=rgb))
        return leds

    def apply_grid(self, grid: GridType) -> None:
        led_to_rgb = {}
        for row in grid.boxes:
            for box in row:
                for led_id in box.led_ids:
                    led_to_rgb[led_id] = (box.rgb.red, box.rgb.green, box.rgb.blue)

        pixels = [led_to_rgb[i] for i in sorted(led_to_rgb)]
        self.pixels = pixels
        self.pixels.show()
