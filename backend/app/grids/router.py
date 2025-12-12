from fastapi import APIRouter
import app.grids.models as models
import app.grids.deps as deps
import app.grids.dtos as dtos

router = APIRouter()


@router.post("/grids")
async def create_grid(grid_data: dtos.GridCreate, grid_repo: deps.GridsRepoDep) -> models.Grid:
    return grid_repo.create_grid(grid_data.to_model())


@router.put("/grids/{grid_id}")
async def update_grid(
    grid_id: int,
    grid_data: dtos.GridUpdate,
    grid_repo: deps.GridsRepoDep,
) -> models.Grid:
    return grid_repo.update_grid(grid_data.to_model(grid_id))


@router.get("/grids")
async def get_grids(grid_repo: deps.GridsRepoDep) -> list[models.Grid]:
    grids = grid_repo.get_grids()

    return grids


@router.get("/grids/{grid_id}")
async def get_grid(grid_id: int, grid_repo: deps.GridsRepoDep) -> dtos.GridResponse:
    grid = grid_repo.get_grid_by_id(grid_id)
    if grid is None:
        raise Exception("grid not found")

    return dtos.GridResponse.from_grid(grid)


@router.delete("/grids/{grid_id}")
async def delete_grid(grid_id: int, grid_repo: deps.GridsRepoDep) -> models.Grid:
    grid = grid_repo.delete_grid(grid_id)
    if grid is None:
        raise Exception("grid not found")

    return grid


@router.get("/boxes")
async def get_boxes(grid_repo: deps.GridsRepoDep) -> list[models.Box]:
    boxes = grid_repo.get_boxes()

    return boxes
