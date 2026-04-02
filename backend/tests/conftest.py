from __future__ import annotations

from pathlib import Path
from typing import Optional, Tuple

import pytest
from fastapi.testclient import TestClient

from app.archive.deps import archive_fetcher
from app.archive.fetcher import ArchiveFetchError
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


class StubArchiveFetcher:
    def __init__(self) -> None:
        self.html_by_url: dict[str, str] = {}
        self.requested_urls: list[str] = []

    def register(self, source_url: str, html: str) -> None:
        self.html_by_url[source_url] = html

    def fetch(self, source_url: str) -> str:
        self.requested_urls.append(source_url)
        if source_url not in self.html_by_url:
            raise ArchiveFetchError(f"no fixture registered for {source_url}")
        return self.html_by_url[source_url]


@pytest.fixture
def client_with_stubs(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    grid_repo.cache_clear()
    led_strip.cache_clear()
    archive_fetcher.cache_clear()
    app.dependency_overrides.clear()

    repo = GridFileRepo(Path("db"))
    strip_stub = StubStrip()
    archive_stub = StubArchiveFetcher()

    app.dependency_overrides[grid_repo] = lambda: repo
    app.dependency_overrides[led_strip] = lambda: strip_stub
    app.dependency_overrides[archive_fetcher] = lambda: archive_stub

    with TestClient(app) as client:
        yield client, strip_stub, archive_stub

    app.dependency_overrides.clear()


@pytest.fixture
def client_with_stub(client_with_stubs):
    client, strip_stub, _ = client_with_stubs
    yield client, strip_stub
