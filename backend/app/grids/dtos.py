from pydantic import BaseModel
from app.grids.models import Grid
from app.grids.models import Box


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
    boxes: list[Box]

    @staticmethod
    def from_grid(grid: Grid) -> "GridResponse":
        if grid.id is None:
            raise Exception("no id")

        return GridResponse(**grid.model_dump(), boxes=grid.boxes)
