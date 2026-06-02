# Repository Guidelines

## Project Overview

KallaxLED backend is a FastAPI application that serves the KallaxLED bookshelf API. It manages a local library catalog, a shelf grid, LED lighting state, and cached Conjuring Archive metadata. The database is SQLite, managed via SQLModel (ORM) and Alembic (migrations). On a Raspberry Pi the LED strip is driven via Adafruit NeoPixel; in development a lightweight stub stands in.

## Module Map

- `main.py` — FastAPI app entry point: registers routers, CORS, and a request-logging middleware.
- `app/books/` — Library catalog CRUD, CSV import/export, Conjuring Archive link and import endpoints, and topic listing.
- `app/grids/` — Shelf grid and box management. `repo.py` (`GridFileRepo`) is the single database access layer used by all routers.
- `app/lights/` — LED scene (`solid`, `off`) and per-box highlight control. Persists state to DB and drives the strip.
- `app/strips/` — Hardware abstraction. `strip.py` defines `Strip`; `stub/` provides in-process fakes for development without a Pi.
- `app/archive/` — Conjuring Archive HTML fetching (`fetcher.py`) and parsing (`parser.py`). `deps.py` wires the fetcher as a FastAPI dependency.
- `app/db.py` — Engine factory and migration runner (called automatically on `GridFileRepo` init).
- `migrations/` — Alembic version files. Applied automatically on startup; source of truth for the schema.

## Build, Test, and Development Commands

```bash
uv sync --extra test        # install deps including pytest
uv run pytest               # run the full test suite
uv run fastapi dev main.py  # start the API server (dev mode, auto-reload)
uv sync --extra dev         # install linting and type-check tools
uv run ruff check app main.py       # lint
uv run ruff check --fix app main.py # auto-fix safe lint issues
uv run ruff format app main.py      # enforce consistent formatting
```

## Python Version and Style

- Target **Python 3.9+**: use `list[T]`, `dict[K, V]`, `tuple[...]` for type hints (not `list | None` union syntax — use `Optional[T]` from `typing` instead).
- 4-space indentation. `snake_case` for modules and functions, `CapWords` for classes.
- Group imports: standard library, third-party, local; blank line between groups.

## Testing Guidelines

- Tests live under `tests/`; run with `uv run pytest`.
- `tests/conftest.py` provides two fixtures:
  - `client_with_stub` — FastAPI `TestClient` with `StubStrip` (records LED calls) and a real `GridFileRepo` in a temp directory.
  - `client_with_stubs` — same, plus a `StubArchiveFetcher` (register HTML fixtures by URL).
- `tmp_path` + `monkeypatch.chdir` isolates each test's SQLite database.
- The archive parser test (`test_archive_parser.py`) uses a real HTML fixture at `tests/fixtures/conjuring_archive_medium_140.html`.
- Hardware-dependent modules (`neopixel`, `board`) are already stubbed in `app/strips/stub/`; no additional mocking needed.

## Migrations

Add new schema changes under `migrations/versions/` using:

```bash
uv run alembic revision -m "short description"
```

Migrations run automatically when `GridFileRepo` is instantiated (via `run_migrations` in `app/db.py`). Do not modify existing migration files after they have been applied.

## Commit & PR Guidelines

- Concise, imperative commit messages (e.g. `Add archive_url to CSV export`).
- Ensure `uv run pytest` passes and `uv run ruff check` is clean before pushing.
- PR descriptions should list what was changed and how it was tested (automated + manual where hardware is involved).
- For changes that touch LED behaviour, note whether the change was validated on the Pi or only against the stub.

## Hardware Notes

- The strip runs on GPIO 18 (`board.D18`) by default; adjust `Strip.default()` if your wiring differs.
- LED count defaults to 150; pass `number_of_leds` to `Strip.default()` to change it.
- Always call `strip.turn_off()` after manual runs to leave the strip dark.
- The `[pi]` extras (`adafruit-circuitpython-neopixel`, `rpi-gpio`, `rpi-ws281x`) are only needed on the Raspberry Pi: `uv sync --extra pi`.
