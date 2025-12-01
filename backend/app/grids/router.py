from fastapi import APIRouter
import app.grids.models as models
import app.grids.deps as deps
import app.strips.deps as strip_deps

router = APIRouter()


@router.post("/grids")
async def create_grid(grid_data: models.Grid, grid_repo: deps.GridsRepoDep) -> models.Grid:
    return grid_repo.create_grid(grid_data)


@router.put("/grids/{grid_id}")
async def update_grid(
    grid_id: str,
    grid_data: models.Grid,
    grid_repo: deps.GridsRepoDep,
    led_strip: strip_deps.LedStripDep,
) -> models.Grid:
    if grid_id != grid_data.id:
        raise Exception("missmatch ids")

    leds = []
    for box in grid_data.boxes:
        for row in box:
            for led in row.leds:
                leds.append(led)
    led_strip.update_leds(leds)
    return grid_repo.update_grid(grid_data)


@router.get("/grids")
async def get_grids(grid_repo: deps.GridsRepoDep) -> list[models.Grid]:
    grids = grid_repo.get_grids()

    return grids


@router.get("/grids/{grid_id}")
async def get_grid(grid_id: str, grid_repo: deps.GridsRepoDep) -> models.Grid:
    grid = grid_repo.get_grid_by_id(grid_id)
    if grid is None:
        raise Exception("grid not found")

    return grid


@router.delete("/grids/{grid_id}")
async def delete_grid(grid_id: str, grid_repo: deps.GridsRepoDep) -> models.Grid:
    grid = grid_repo.delete_grid(grid_id)
    if grid is None:
        raise Exception("grid not found")

    return grid
