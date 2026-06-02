## Development Workflow

- Run `uv sync --extra test` on macOS to install cross-platform dependencies and test tooling.
- Execute `uv run pytest` to run the stubbed unit tests locally.
- On Raspberry Pi deploys, run `uv sync --extra pi --extra test` to include the hardware drivers alongside the test suite.
- Launch the animation loop on Pi with `uv run --extra pi main.py`; interrupt with `Ctrl+C`.

## Raspberry Pi Pull Notes

- Pull the branch on the Pi, then run `./bin/up` to sync the runtime dependencies used by the FastAPI backend and the LED drivers.
- The backend now applies Alembic migrations automatically when the repository code opens the SQLite database, so there is no separate manual migration step required before starting the app.
- Start the API with `./bin/server`. On Pi this runs the FastAPI dev server on `0.0.0.0:5000`.
- If you want to run the backend tests on the Pi before starting the app, use `uv sync --extra pi --extra test` and then `uv run pytest`.
