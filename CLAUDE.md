# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KallaxLED is a personal magic-book-shelf app: it catalogs physical books on an IKEA Kallax shelf, links them to Conjuring Archive metadata, provides full-text search, and highlights the correct shelf box via NeoPixel LEDs driven by a Raspberry Pi.

- **Backend** (`backend/`): FastAPI + SQLite + SQLModel + Alembic, managed with `uv`
- **Frontend** (`frontend/`): React Router v7 + Vite + Tailwind CSS v4
- **Hardware**: Adafruit NeoPixel on RPi GPIO 18; stubs available for development without hardware

## Backend Commands

All backend commands run from the `backend/` directory. **`uv` is not installed on macOS — backend tests must be run over SSH on the Raspberry Pi.**

```bash
uv sync --extra test               # install deps + test tooling
uv run pytest                      # run full test suite
uv run pytest tests/test_foo.py    # run a single test file
uv run fastapi dev main.py         # dev server with auto-reload (local)
bin/server                         # start server (auto-selects Mac vs Pi)
bin/up                             # sync runtime deps on Pi after a pull
bin/verify                         # full gate: ruff format + check, pyright, pytest
uv sync --extra dev                # install ruff + pyright
uv run ruff check app main.py      # lint
uv run ruff check --fix app main.py
uv run ruff format app main.py
uv run alembic revision -m "msg"   # create a new migration
```

On the Pi: `uv sync --extra pi --extra test` to include hardware drivers alongside tests.

The `app` package is imported as a top-level package (e.g. `from app.grids.deps import grid_repo`) but is never installed into the venv (no `[build-system]` in `pyproject.toml`). Tests resolve it via `[tool.pytest.ini_options] pythonpath = ["."]` in `backend/pyproject.toml` — do not remove that, or `uv run pytest` fails with `ModuleNotFoundError: No module named 'app'`. Running pytest by hand outside that config needs `backend/` on `sys.path` (e.g. `python -m pytest`).

## Frontend Commands

Run from the `frontend/` directory.

```bash
npm install       # install dependencies
npm run dev       # Vite dev server
npm run build     # production build
npm run test      # Vitest (run once)
npm run test:watch
npm run typecheck # tsc
```

The dev server proxies API calls to the Pi at the URL in `frontend/.env.development` (`VITE_BACKEND_URL`).

## Architecture

### Data model

- `library_books` — local physical books with box assignment, personal tags, notes
- `archive_publications` — cached Conjuring Archive publication metadata
- `archive_entries` — indexed entry titles from linked publications
- `magic_topics` — hierarchical topic tree (e.g. packet tricks, false shuffles)
- `archive_entry_topic_links` — join table

Archive metadata is kept separate from local book data so re-imports never overwrite local notes/tags. Archive linking is two-step: link (preview only) then import (full entry+topic indexing).

### Backend module map

- `main.py` — FastAPI app; registers routers, CORS, request-logging middleware. All routes are prefixed `/api`.
- `app/books/` — Library CRUD, CSV import/export, archive link/import, topic listing
- `app/grids/` — Grid and box management; `repo.py` (`GridFileRepo`) is the single DB access layer
- `app/lights/` — Scene (`solid`, `off`) and per-box highlight; persists state to DB, drives the strip
- `app/strips/` — Hardware abstraction (`strip.py`); `stub/` provides in-process fakes for dev
- `app/archive/` — Conjuring Archive HTML fetching (`fetcher.py`) and parsing (`parser.py`)
- `app/db.py` — Engine factory; `run_migrations` is called automatically when `GridFileRepo` is instantiated
- `migrations/` — Alembic version files; applied automatically on startup

### Frontend module map

- `app/routes/home.tsx` — Search-first dashboard (`/`)
- `app/routes/manage.tsx` + `manage.*.tsx` — Secondary workspace for catalog, grid, and LED setup (`/manage`)
- `app/utils/api.ts` — Shared API client (axios); all types and API calls live here
- `app/utils/utils.ts` — Shared utilities
- Legacy routes (`redirect.books.tsx`, `redirect.grid.tsx`, `redirect.leds.tsx`) redirect into `/manage`

### Key design decisions

- Single grid, single lighting-state row in DB
- Grid width/height is inferred from max box x/y, not stored on the Grid model
- Search runs in Python (loads all books, filters in memory) — fine at personal scale

## Testing

Backend tests use two fixtures from `tests/conftest.py`:
- `client_with_stub` — `TestClient` with `StubStrip` + real `GridFileRepo` in a temp dir
- `client_with_stubs` — same, plus `StubArchiveFetcher` (register HTML fixtures by URL)

Archive parser tests use a real HTML fixture at `tests/fixtures/conjuring_archive_medium_140.html`.

## Migrations

Never modify existing migration files after they have been applied. To add schema changes:

```bash
uv run alembic revision -m "short description"
```

## Python Style

- Target Python 3.13: use `list[T]`, `dict[K, V]`, and `T | None` (not `Optional[T]`/`Union[A, B]` from `typing`)
- Import ABCs from `collections.abc` (`Iterable`, `Callable`), not `typing`. `Annotated` and `Literal` still come from `typing`
- Ruff's `UP` (pyupgrade) rule set enforces both of the above — `uv run ruff check --fix app main.py` will rewrite violations
- Line length: 120 (ruff)
- `snake_case` for modules/functions, `CapWords` for classes
- Import order: stdlib → third-party → local, blank line between groups

## Raspberry Pi Deployment

```bash
# On the Pi after pulling
cd backend && ./bin/up    # sync deps
./bin/server              # start API on 0.0.0.0:5000
```

Hardware defaults: GPIO 18 (`board.D18`), 150 LEDs. The `[pi]` extras (`adafruit-circuitpython-neopixel`, `rpi-gpio`, `rpi-ws281x`) are only needed on the Pi.
