class NeoPixel:
    def __init__(self, _pin, n: int, auto_write: bool = False, *args, **kwargs) -> None:
        self.auto_write = auto_write
        self.pixels = [(0, 0, 0) for _ in range(n)]

    def __len__(self) -> int:
        return len(self.pixels)

    def __getitem__(self, index: int):
        return self.pixels[index]

    def __setitem__(self, index: int, value) -> None:
        self.pixels[index] = value

    def fill(self, value) -> None:
        for i in range(len(self.pixels)):
            self.pixels[i] = value

    def show(self) -> None:
        return None
