# Repository Guidelines

## Project Structure & Module Organization
- `main.py` orchestrates the sample animation loop and is the quickest entry point for validating new effects.
- `app/` houses reusable helpers; `strip.py` defines the `Strip` class along with transition, bullet, and swipe utilities.
- Place additional animation modules under `app/` and expose shared helpers via `app/__init__.py` for consistent imports.
- Add tests under `tests/` (create the folder if absent) and mirror module names, e.g., `tests/test_strip.py` for `app/strip.py`.

## Build, Test, and Development Commands
- `uv sync` installs the locked dependency set defined in `pyproject.toml` and `uv.lock`.
- `uv run main.py` executes the default animation on the connected NeoPixel strip; interrupt with `Ctrl+C` when finished.
- `uv run ruff check app main.py` lints the code; use `uv run ruff check --fix` to apply safe auto-fixes.
- `uv run ruff format app main.py` enforces consistent formatting before committing.

## Coding Style & Naming Conventions
- Target Python 3.9+ with 4-space indentation and explicit type hints (`list[int]`, `tuple[int, int, int]`) for LED calculations.
- Keep modules lowercase_with_underscores, classes in CapWords (`Strip`), and functions or methods in snake_case (`transition_single_led`).
- Group imports as in `app/strip.py`: standard library, third-party, then local modules; leave a blank line between groups.
- Declare shared numeric or color constants in ALL_CAPS (e.g., `RGB`, `Pixels`) to distinguish configuration from runtime state.

## Testing Guidelines
- Use `pytest` for unit tests; install it with `uv add pytest` and run suites via `uv run pytest`.
- Mock hardware-dependent modules such as `neopixel` and `board` so tests stay deterministic even without a connected strip.
- Prefer `numpy.testing` helpers when asserting LED state arrays returned by animation helpers.
- Document any manual hardware validation (e.g., LED colors observed) in the PR when automated coverage is impractical.

## Commit & Pull Request Guidelines
- Follow the existing history: concise, action-oriented commit messages such as `Refine bullet transition`; keep them in the imperative mood.
- Ensure the working tree is clean (`git status`) and lint/tests pass before pushing.
- PR descriptions should summarize the change, list automated and hardware tests performed, and link related issues or tickets.
- Attach screenshots or short videos whenever a visual effect changes so reviewers can confirm the expected output.

## Hardware & Configuration Tips
- By default the strip runs on GPIO 18 via `board.D18`; adjust `Strip.default()` if your wiring requires a different pin or LED count.
- Always shut off LEDs after manual runs by calling `strip.turn_off()` in a `finally` block, as illustrated in `main.py`.
- For desk-side development without hardware, wrap `neopixel.NeoPixel` in a lightweight stub that records writes to a NumPy array, then reuse the existing animation helpers against the stub.
