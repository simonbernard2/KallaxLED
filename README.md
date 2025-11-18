# LEDControl

LEDControl is a React Router + Redux application for visualizing and configuring an LED bookshelf grid,
backed by a Python API on a Raspberry Pi that drives the physical LED strip. It provides a simple dashboard where you can:

- View the current LED grid with a clear OFF state for unlit boxes
- Resize the grid (1–7 columns/rows) and persist the new dimensions
- Navigate between the bookshelf view and the configuration page via a global navbar
- Work with familiar tooling: Vite dev server, TypeScript, Tailwind, and Vitest + Testing Library

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the test suite:

```bash
npm run test
```

Build for production:

```bash
npm run build
```

## Project Structure

- `app/routes/home.tsx` – landing page and shell
- `app/routes/bookshelf.tsx` – renders the LED bookshelf grid
- `app/routes/config.tsx` – form to configure grid dimensions with validation
- `app/features/bookshelf` – Redux slice, grid/box components, and shared types
- `tests/` – Vitest coverage for the grid, boxes, slice logic, and utilities

## TODO

- [x] Create a color picker
- [ ] Update boxes to support color changes and brightness per cell
- [ ] Fetch live grid data from the Raspberry Pi Python API that controls the LED strip
- [ ] Push changes from the UI back to the API, with optimistic updates and error handling
- [ ] Add presets (patterns/scenes) and quick-apply buttons
- [ ] Enable live preview over WebSockets so grids update without page refresh
- [ ] Persist grid settings locally and add basic auth before sending updates to the Pi
- [ ] Expand integration tests to cover API interactions and real-time updates
- [ ] Give a bit of love to the UI/UX
