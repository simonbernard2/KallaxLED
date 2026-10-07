# KallaxLED frontend

React Router v7 (SPA mode) + Vite + Tailwind v4 UI for KallaxLED. It talks to the FastAPI backend
on the Raspberry Pi over HTTP; there is no server-side rendering and no server bundle.

## Getting started

```bash
npm install
npm run dev          # Vite dev server
npm run test         # Vitest
npm run typecheck    # tsc --noEmit
npm run build        # production SPA build into build/client
npm run format:check # prettier
```

The backend URL comes from `VITE_BACKEND_URL` in `.env.development`. It points at the Pi's LAN
address, so the browser calls the Pi directly — there is no Vite proxy, which is why the backend
sets permissive CORS.

## Structure

- `app/routes.ts` — explicit route config (not file-based routing).
- `app/root.tsx` — HTML shell, navbar, and the error boundary.
- `app/routes/home.tsx` — `Find` at `/`: debounced search, topic quick-filters, per-book
  highlight, and the scene controls.
- `app/routes/manage.tsx` + `manage.*.tsx` — `Manage` at `/manage`: catalog CRUD with CSV
  import/export and Conjuring Archive linking, grid setup, LED assignment, and page-size settings.
- `app/routes/redirect.*.tsx` — legacy `/books` and `/grid*` URLs redirect into `/manage`.
- `app/utils/api.ts` — the single axios client; every endpoint type and call lives here.
- `app/utils/use-paged-list.ts` — shared "first page, then append" list state, used by both
  search screens.
- `app/utils/settings.ts` — per-device page size, stored in `localStorage` via
  `useSyncExternalStore` with cross-tab invalidation.
- `app/utils/components/` — shared `Button`, `Input`, `BookRow`, `NavBar`, `Page`.
- `app/grids/` — `GridDisplay`, `ShelfBoxPicker`, and `formatBoxLabel`.
- `tests/` — Vitest + Testing Library, with `~/utils/api` mocked per route.

## Styling

Tailwind v4, configured CSS-first in `app/app.css` — there is no `tailwind.config.js`. Colors are
CSS variables with a `prefers-color-scheme: dark` block; use the tokens (`--surface`, `--danger`,
`--chrome-bg`) rather than literal `bg-white/*` or `border-black/*`, which glare in dark mode.
`--forest` is a solid fill that always carries white text; `--forest-ink` is the readable variant
on a panel. They diverge in dark mode and are not interchangeable.

## Known gaps

Tracked in the root [README](../README.md#known-ux-gaps). The short version: status and error
banners render at the bottom of the page and never auto-clear, LED setup has no range assignment or
undo, `BookRow` hides the box label below 640px, and there is no ESLint config despite an
`eslint-disable` comment in `home.tsx`.
