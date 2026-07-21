from typing import Union

import numpy as np

from app.strips.models import LED, Color

try:
    import board  # type: ignore
    import neopixel  # type: ignore
except ImportError:
    from app.strips.stub import board, neopixel

# Colors arrive from the UI as sRGB, but a WS2812 drives its channels with linear PWM: writing 128
# emits about half the light rather than the ~22% the eye reads from a mid-grey swatch. Encoding
# through this LUT on the way to the hardware is what makes a picked color look like the color shown.
GAMMA = 2.6
_GAMMA_LUT: np.ndarray = np.round(((np.arange(256) / 255.0) ** GAMMA) * 255.0).astype(np.uint8)


class Strip:
    """Facade over a NeoPixel strip with helpers for common bookshelf animations.

    Public methods take and report sRGB. Gamma encoding happens only at the driver boundary, so
    every caller — highlights, scenes, and the animation engine — is corrected without knowing about it.
    """

    def __init__(
        self,
        g_pid,
        number_of_leds: int,
        auto_write: bool = False,
    ) -> None:
        self.pixels: neopixel.NeoPixel = neopixel.NeoPixel(g_pid, number_of_leds, auto_write=auto_write)
        # The driver holds gamma-encoded values, so reading it back would report colors nobody asked
        # for. Keep the requested sRGB alongside it and answer reads from here.
        self._requested: np.ndarray = np.zeros((number_of_leds, 3), dtype=np.uint8)

    @classmethod
    def default(cls, *, number_of_leds: int = 150, auto_write: bool = False) -> "Strip":
        return cls(
            board.D18,
            number_of_leds,
            auto_write=auto_write,
        )

    def turn_off(self) -> None:
        self._requested[:] = 0
        self.pixels.fill((0, 0, 0))
        self.pixels.show()

    def leds(self) -> list[LED]:
        return [LED(id=i, rgb=(int(r), int(g), int(b))) for i, (r, g, b) in enumerate(self._requested)]

    def update_led(self, index: int, color: Color) -> None:
        self._set(index, color.rgb)
        self.pixels.show()

    def update_leds(self, leds: list[LED]) -> None:
        for led in leds:
            self._set(led.id, led.rgb)
        self.pixels.show()

    def update_leds_by_ids(self, led_ids: list[int], color: Union[Color, tuple[int, int, int]]) -> None:
        rgb = color.rgb if isinstance(color, Color) else color
        for led_id in led_ids:
            self._set(led_id, rgb)
        self.pixels.show()

    def show_frame(self, frame: np.ndarray) -> None:
        """Write an (N, 3) array of per-pixel sRGB colors and flush once.

        The LUT is applied to the whole frame at once to keep the render loop cheap; values are cast
        to int because the NeoPixel driver rejects numpy scalars.
        """
        count = len(self.pixels)
        self._requested[:count] = frame[:count]
        encoded = _GAMMA_LUT[self._requested[:count]]
        for i in range(count):
            rgb = encoded[i]
            self.pixels[i] = (int(rgb[0]), int(rgb[1]), int(rgb[2]))
        self.pixels.show()

    def _set(self, index: int, rgb: tuple[int, int, int]) -> None:
        """Record the requested sRGB and hand the gamma-encoded value to the driver."""
        self._requested[index] = rgb
        self.pixels[index] = (int(_GAMMA_LUT[rgb[0]]), int(_GAMMA_LUT[rgb[1]]), int(_GAMMA_LUT[rgb[2]]))
