from pydantic import BaseModel

from app.grids.models import Box, Grid


def _calculate_dimensions(boxes: list[Box]) -> tuple[int, int]:
    if not boxes:
        return 0, 0

    max_x = max(box.x for box in boxes)
    max_y = max(box.y for box in boxes)

    return max_x + 1, max_y + 1


class GridCreate(BaseModel):
    name: str
    width: int
    height: int

    def to_model(self) -> Grid:
        boxes = []
        for x in range(self.width):
            for y in range(self.height):
                box = Box(x=x, y=y, leds=[])
                boxes.append(box)

        return Grid(boxes=boxes, name=self.name)


class GridUpdate(BaseModel):
    name: str

    def to_model(self, id: int) -> Grid:
        return Grid(id=id, name=self.name)


class GridResponse(BaseModel):
    id: int
    name: str
    boxes: list[list[Box]]

    @staticmethod
    def _build_box_grid(boxes: list[Box]) -> list[list[Box]]:
        width, height = _calculate_dimensions(boxes)
        if width == 0 or height == 0:
            return []

        box_map = {(box.x, box.y): box for box in boxes}

        grid: list[list[Box]] = []
        for y in range(height):
            row: list[Box] = []
            for x in range(width):
                box = box_map.get((x, y))
                if box is None:
                    raise ValueError(f"missing box at x={x} y={y}")
                row.append(box)
            grid.append(row)

        return grid

    @staticmethod
    def from_grid(grid: Grid) -> "GridResponse":
        if grid.id is None:
            raise Exception("no id")

        return GridResponse(**grid.model_dump(), boxes=GridResponse._build_box_grid(grid.boxes))


class GridListItem(BaseModel):
    id: int
    name: str
    width: int
    height: int

    @staticmethod
    def from_grid(grid: Grid) -> "GridListItem":
        if grid.id is None:
            raise Exception("no id")

        width, height = _calculate_dimensions(grid.boxes)

        return GridListItem(
            id=grid.id,
            name=grid.name,
            width=width,
            height=height,
        )
