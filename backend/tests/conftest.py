from pathlib import Path
from typing import Optional, Tuple

import pytest
from fastapi.testclient import TestClient

from app.grids.deps import grid_repo
from app.grids.repo import GridFileRepo
from app.main import app
from app.strips.deps import led_strip


class StubStrip:
    def __init__(self) -> None:
        self.off_calls = 0
        self.last_update: Optional[Tuple[list[int], Tuple[int, int, int]]] = None

    def turn_off(self) -> None:
        self.off_calls += 1

    def update_leds_by_ids(self, led_ids: list[int], color: tuple[int, int, int]) -> None:
        self.last_update = (list(led_ids), color)


@pytest.fixture
def client_with_stub(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    grid_repo.cache_clear()
    led_strip.cache_clear()
    app.dependency_overrides.clear()

    repo = GridFileRepo(Path("db"))
    stub = StubStrip()

    app.dependency_overrides[grid_repo] = lambda: repo
    app.dependency_overrides[led_strip] = lambda: stub

    with TestClient(app) as client:
        yield client, stub

    app.dependency_overrides.clear()
