from app.grids.repo import GridFileRepo
from app.animations.models import Animation
from app.animations import mappers
from app.strips.services import StripService
from app.animations.repo import AnimationFileRepo


class AnimationService:
    def __init__(self, animation_repo: AnimationFileRepo, grid_repo: GridFileRepo, strip_service: StripService) -> None:
        self.animation_repo = animation_repo
        self.grid_repo = grid_repo
        self.strip_service = strip_service

    def create_animation(self, animation: Animation) -> Animation:
        return self.animation_repo.create(animation)
    
    def list_animations(self, grid_id: str) -> list[Animation]:
        return self.animation_repo.get_grid_animations(grid_id)

    def play_animation(self, animation_id: str) -> None:
        animation = self.animation_repo.get_one(animation_id)
        if animation is None:
            raise Exception("animation not found")

        self.animate_adhoc(animation)

    def animate_adhoc(self, animation: Animation) -> None:
        grid = self.grid_repo.get_grid_by_id(animation.grid_id)
        if grid is None:
            raise Exception("grid not found")

        strip_animation = mappers.to_strip_animation(grid, animation)
        self.strip_service.animate(strip_animation)
