from fastapi import APIRouter
import app.animations.models as models
import app.animations.deps as deps

router = APIRouter()


@router.get("/grids/{grid_id}/animations")
async def list_grid_animations(
    grid_id: str, animation_service: deps.AnimationServiceDep
) -> list[models.Animation]:
    return animation_service.list_animations(grid_id)


@router.post("/grids/{grid_id}/animations")
async def create_animation(
    grid_id: str, animation: models.Animation, animation_service: deps.AnimationServiceDep
) -> models.Animation:
    animation.grid_id = grid_id
    return animation_service.create_animation(animation)


@router.post("/animations/{animation_id}/play")
async def play_animation(animation_id: str, animation_service: deps.AnimationServiceDep) -> None:
    animation_service.play_animation(animation_id)
