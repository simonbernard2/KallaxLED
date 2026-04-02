from pydantic import BaseModel, Field

from app.grids.models import Box, Grid


def _calculate_dimensions(boxes: list[Box]) -> tuple[int, int]:
    if not boxes:
        return 0, 0

    max_x = max(box.x for box in boxes)
    max_y = max(box.y for box in boxes)

    return max_x + 1, max_y + 1


class GridCreate(BaseModel):
    name: str
    width: int = Field(ge=1, le=12)
    height: int = Field(ge=1, le=12)

    def to_model(self) -> Grid:
        boxes = []
        for x in range(self.width):
            for y in range(self.height):
                box = Box(x=x, y=y, leds=[])
                boxes.append(box)

        return Grid(boxes=boxes, name=self.name)


class GridUpdate(BaseModel):
    name: str
    width: int = Field(ge=1, le=12)
    height: int = Field(ge=1, le=12)

    def to_model(self, id: int) -> Grid:
        return Grid(id=id, name=self.name)


class BoxResponse(BaseModel):
    id: int
    x: int
    y: int
    leds: list[int]

    @staticmethod
    def from_box(box: Box) -> "BoxResponse":
        if box.id is None:
            raise Exception("no id")
        return BoxResponse(id=box.id, x=box.x, y=box.y, leds=box.leds)


class GridResponse(BaseModel):
    id: int
    name: str
    width: int
    height: int
    boxes: list[list[BoxResponse]]

    @staticmethod
    def _build_box_grid(boxes: list[Box]) -> list[list[BoxResponse]]:
        width, height = _calculate_dimensions(boxes)
        if width == 0 or height == 0:
            return []

        box_map = {(box.x, box.y): box for box in boxes}

        grid: list[list[BoxResponse]] = []
        for y in range(height):
            row: list[BoxResponse] = []
            for x in range(width):
                box = box_map.get((x, y))
                if box is None:
                    raise ValueError(f"missing box at x={x} y={y}")
                row.append(BoxResponse.from_box(box))
            grid.append(row)

        return grid

    @staticmethod
    def from_grid(grid: Grid) -> "GridResponse":
        if grid.id is None:
            raise Exception("no id")

        width, height = _calculate_dimensions(grid.boxes)
        return GridResponse(
            id=grid.id,
            name=grid.name,
            width=width,
            height=height,
            boxes=GridResponse._build_box_grid(grid.boxes),
        )
