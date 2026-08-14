from fastapi import APIRouter, HTTPException

import app.grids.deps as deps
import app.grids.dtos as dtos
import app.grids.models as models

router = APIRouter()


@router.post("/grid")
async def create_grid(grid_data: dtos.GridCreate, grid_repo: deps.GridsRepoDep) -> dtos.GridResponse:
    grid = grid_repo.create_grid(grid_data.to_model())
    return dtos.GridResponse.from_grid(grid)


@router.get("/grid")
async def get_grid(grid_repo: deps.GridsRepoDep) -> dtos.GridResponse:
    grid = grid_repo.get_grid()
    if grid is None:
        raise HTTPException(status_code=404, detail="grid not found")
    return dtos.GridResponse.from_grid(grid)


@router.put("/grid")
async def update_grid(grid_data: dtos.GridUpdate, grid_repo: deps.GridsRepoDep) -> dtos.GridResponse:
    grid = grid_repo.update_grid(grid_data.name, grid_data.width, grid_data.height)
    if grid is None:
        raise HTTPException(status_code=404, detail="grid not found")
    return dtos.GridResponse.from_grid(grid)


@router.put("/grid/leds")
async def update_grid_leds(
    assignments: dict[int, list[int]],
    grid_repo: deps.GridsRepoDep,
) -> dtos.GridResponse:
    grid_repo.update_led_assignments(assignments)
    grid = grid_repo.get_grid()
    if grid is None:
        raise HTTPException(status_code=404, detail="grid not found")
    return dtos.GridResponse.from_grid(grid)


@router.get("/boxes")
async def get_boxes(grid_repo: deps.GridsRepoDep) -> list[models.Box]:
    boxes = grid_repo.get_boxes()

    return boxes
