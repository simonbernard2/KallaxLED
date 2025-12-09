class NeoPixel:
    def __init__(self, g_pid, number_of_leds, **kwargs) -> None:
        self.pixels: any = [(0, 0, 0) for i in range(number_of_leds)]

    def __getitem__(self, key: int) -> any:
        return self.pixels[key]

    def __setitem__(self, key: int, value: tuple[int, int, int]) -> None:
        self.pixels[key] = value

    def show(self) -> None:
        strip = ""
        for p in self.pixels:
            if NeoPixel.__is_off(p):
                strip += "."
            else:
                strip += "o"

        print(strip)

    def fill(self, rgb: tuple[int, int, int]) -> None:
        self.pixels = [rgb for _ in self.pixels]

    def __is_off(pixel: tuple[int, int, int]) -> bool:
        return pixel == (0, 0, 0)
