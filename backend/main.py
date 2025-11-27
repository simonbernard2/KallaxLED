from fastapi import FastAPI, Depends
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
import app.base_models as models
import app.db as db
import app.deps as deps
import app.strip as strip

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of allowed origins
    allow_credentials=False,  # Allow cookies/authorization headers
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],  # Allow all headers
)

GridRepoDep = Annotated[db.GridFileRepo, Depends(deps.grid_repo)]
LedStripDep = Annotated[strip.Strip, Depends(deps.led_strip)]


@app.post("/grids")
async def create_grid(grid_data: models.Grid, grid_repo: GridRepoDep) -> models.Grid:
    return grid_repo.create_grid(grid_data)


@app.put("/grids/{grid_id}")
async def update_grid(
    grid_id: str, grid_data: models.Grid, grid_repo: GridRepoDep
) -> models.Grid:
    if grid_id != grid_data.id:
        raise Exception("missmatch ids")

    return grid_repo.update_grid(grid_data)


@app.get("/grids")
async def get_grids(grid_repo: GridRepoDep) -> list[models.Grid]:
    grids = grid_repo.get_grids()

    return grids


@app.get("/grids/{grid_id}")
async def get_grid(grid_id: str, grid_repo: GridRepoDep) -> models.Grid:
    grid = grid_repo.get_grid_by_id(grid_id)
    if grid is None:
        raise Exception("grid not found")

    return grid


@app.put("/leds/{led_id}")
async def update_led(
    led_id: int, color: models.Color, led_strip: LedStripDep
) -> models.LED:
    led_strip.update_led(led_id, color)
    return models.LED(id=led_id, rgb=color.rgb)
