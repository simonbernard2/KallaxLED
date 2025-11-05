## Development Workflow

- Run `uv sync --extra test` on macOS to install cross-platform dependencies and test tooling.
- Execute `uv run pytest` to run the stubbed unit tests locally.
- On Raspberry Pi deploys, run `uv sync --extra pi --extra test` to include the hardware drivers alongside the test suite.
- Launch the animation loop on Pi with `uv run --extra pi main.py`; interrupt with `Ctrl+C`.
