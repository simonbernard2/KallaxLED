import sys
import types
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _ensure_board_stub() -> None:
    if "board" in sys.modules:
        return

    board_stub = types.ModuleType("board")
    board_stub.D18 = object()
    sys.modules["board"] = board_stub


def _ensure_neopixel_stub() -> None:
    if "neopixel" in sys.modules:
        return

    neopixel_stub = types.ModuleType("neopixel")

    class _NeoPixel:
        def __init__(self, _pin, number_of_leds, *, auto_write: bool = False):
            self._auto_write = auto_write
            self._data = [(0, 0, 0)] * number_of_leds

        def __len__(self) -> int:
            return len(self._data)

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

    neopixel_stub.NeoPixel = _NeoPixel
    sys.modules["neopixel"] = neopixel_stub


_ensure_board_stub()
_ensure_neopixel_stub()
