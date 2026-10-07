from typing import Annotated

from pydantic import BaseModel, Field

# The gamma LUT in strip.py is a 256-entry table indexed directly by channel value, so anything
# outside 0-255 is an IndexError at the driver boundary rather than a clamped color. Bound it here,
# at the one place every colour enters the app, and the strip never has to defend itself.
Channel = Annotated[int, Field(ge=0, le=255)]
RGB = tuple[Channel, Channel, Channel]


class Color(BaseModel):
    rgb: RGB


class LED(BaseModel):
    id: int
    rgb: RGB
