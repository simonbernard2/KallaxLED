import app.animations.models as models
from typing import Optional
from pathlib import Path
import pickle
import uuid

from app.grids.repo import GridFileRepo


class AnimationFileRepo:
    def __init__(self, dir_path: Path, grid_repo: GridFileRepo) -> None:
        self.grid_repo = grid_repo
        self.dir_path = dir_path
        self.dir_path.mkdir(exist_ok=True)
        self.db_file = self.dir_path / "animation.pk"
        self.animations: dict[str, models.Animation] = {}
        if self.db_file.exists():
            with self.db_file.open("rb") as handle:
                self.animations = pickle.load(handle)

    def get_grid_animations(self, grid_id: str) -> list[models.Animation]:
        return [a for a in self.animations.values() if a.grid_id == grid_id]

    def get_one(self, animation_id: str) -> Optional[models.Animation]:
        return self.animations.get(animation_id)

    def create(self, animation: models.Animation) -> models.Animation:
        if animation.id is not None:
            raise Exception("can't create an animation with an existing id")
        if animation.grid_id is None or self.grid_repo.get_grid_by_id(animation.grid_id) is None:
            raise Exception("can't create an animation without an existing grid")

        animation.id = str(uuid.uuid4())

        self.__save_to_db(animation)
        return animation

    def __save_to_db(self, animation: models.Animation) -> None:
        if animation.id is None:
            return

        self.animations[animation.id] = animation
        self.__update_db_file()

    def __update_db_file(self) -> None:
        with self.db_file.open("wb") as handle:
            pickle.dump(self.animations, handle)
