from app.grids.repo import GridFileRepo
from app.animations.models import Animation
from app.animations import mappers
from app.strips.services import StripService


class AnimationService:
    def __init__(self, grid_repo: GridFileRepo, strip_service: StripService) -> None:
        self.grid_repo = grid_repo
        self.strip_service = strip_service
    
    def animate_adhoc(self, animation: Animation) -> None:
        grid = self.grid_repo.get_grid_by_id(animation.grid_id)
        if grid is None:
            raise Exception("grid not found")        
        
        strip_animation = mappers.to_strip_animation(grid, animation)
        self.strip_service.animate(strip_animation)
