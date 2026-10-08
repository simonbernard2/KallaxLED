# KallaxLED

KallaxLED is a reader-first bookshelf app for finding a book or magic topic fast and lighting the correct shelf box.

## Product Direction

- Primary audience: the person standing in front of the shelf who wants to find a book quickly.
- Core action: search by title, author, ISBN, personal tag, Conjuring Archive entry title, or Conjuring Archive topic path.
- Daily-use controls: highlight a shelf box and apply simple scenes.
- Support workflows: manage the local library, link Conjuring Archive publications, import structured metadata, define the grid, and assign LEDs.

## Data Model

- `library_books`: local physical books on the shelf with box assignment, personal tags, and notes.
- `archive_publications`: cached Conjuring Archive publication metadata linked to local books.
- `archive_entries`: indexed entry titles imported from linked publications.
- `magic_topics`: hierarchical topics such as packet tricks or false shuffle families.
- `archive_entry_topic_links`: join table between entries and topics.

Imported archive metadata stays separate from local shelf data so re-imports do not overwrite local notes and tags.

## App Structure

- `Find` at `/`: search-first dashboard with match context and one-tap highlight.
- `Manage` at `/manage`: secondary workspace for catalog, grid, and LED setup.
- `Manage > Books`: CRUD for local books plus archive linking/import.
- `Manage > Grid`: grid overview and naming.
- `Manage > LED Setup`: assign physical LED ids to grid boxes.

Legacy routes under `/books` and `/grid` redirect into the new manage area.

## Backend

- FastAPI under [`backend`](./backend) serves bookshelf, grid, lights, archive-link, archive-import, and topic endpoints.
- SQLite remains the default local store.
- Alembic migrations are now the schema source of truth.
- Conjuring Archive metadata is linked manually by URL or medium id and cached locally after import.
- `/books` and `/books/search` are paged: both accept `limit` (default 50, max 200) and `offset`, and
  return `{ items, total, limit, offset }` rather than a bare array. `total` is the full match count,
  so the UI can say "showing 50 of 62". Search still scores every book in Python and slices at the
  router — fine at personal scale, revisit around a thousand books.

## Frontend

- React Router v7 + Vite under [`frontend`](./frontend).
- Responsive web-first UI with a warm library-inspired visual system.
- Shared API client in [`frontend/app/utils/api.ts`](./frontend/app/utils/api.ts).
- Books render as one-line rows via [`BookRow`](./frontend/app/utils/components/book-row/book-row.tsx),
  with match reasons, notes, archive detail, and the Manage edit form behind a toggle. A row with
  nothing to reveal stays inert instead of opening onto an empty panel.
- Colors live as CSS variables in [`app.css`](./frontend/app/app.css) with a `prefers-color-scheme`
  dark block. Use the tokens (`--surface`, `--danger`, `--chrome-bg`) rather than literal
  `bg-white/*` or `border-black/*`, which glare in dark mode. Note that `--forest` is a solid fill
  that always carries white text while `--forest-ink` is the readable variant on a panel; they
  diverge in dark mode and are not interchangeable.

## Lighting and Color

Colors are picked and stored as sRGB, but a WS2812 drives its channels with linear PWM — writing
128 emits about half the available light, not the ~22% the eye reads from a mid-grey swatch. Without
correction every mid-tone came out roughly twice as bright as the on-screen swatch, and dark colors
collapsed into a handful of visible steps.

- A gamma LUT (`GAMMA = 2.6`) is applied at the driver boundary inside
  [`Strip`](./backend/app/strips/strip.py). That is the single choke point for every write, so
  highlights, scenes, and the animation engine are all corrected without knowing about it.
- Because the driver then holds encoded values, `Strip` keeps a parallel `_requested` buffer of the
  sRGB it was given, and `leds()` answers from that. Reading back from the driver would report colors
  nobody asked for.
- `GAMMA` is a perceptual judgement, not a constant of nature. Raise it if mid-tones still look
  bright, lower it if dark colors crush to black too early.
- Per-channel white balance is **not** implemented. WS2812s are green-biased, so `#ffffff` still
  reads slightly green. That is the remaining half of color fidelity.
- Dragging a color picker in `Find` re-pushes to whatever is already lit, making the shelf itself the
  preview. It deliberately no-ops when nothing is on, so a picker never switches the lights on by
  itself.

## Roadmap

1. Stabilize archive parsing against more real publication fixtures.
2. Add richer filtering and topic autocomplete in `Find`.
3. Add personal archive overrides and annotations beyond simple local tags/notes.
4. Build a Raycast extension on top of the same search and highlight endpoints.

### Known UX gaps

Carried over from a UI review; roughly in priority order.

- **LED setup ergonomics.** Mapping LEDs one tap at a time with no keyboard shortcuts, no undo after
  auto-advance, and no range assignment (`LEDs 12–20 → this box`), which is how a strip physically
  runs. There is also no view of which LEDs are still unmapped, and `MAX_LED_ID` is hardcoded in the
  frontend instead of coming from the API.
- **Status and error placement.** Both render at the bottom of the page and never auto-clear, so
  feedback can land several screens below the control that triggered it. Wants toasts.
- **`Link archive` vs `Import metadata`.** Two adjacent buttons with no indication that one previews
  and the other does the real indexing, or that they run in order.
- **Accessibility.** No `focus-visible` styling on buttons, pills, or nav links, and `.field-input`
  sets `outline-none` while signalling focus only by border color — keyboard navigation is
  effectively invisible. Placeholder contrast is around 3:1, below the 4.5:1 minimum.
- **Unbounded topic list.** `Find` renders every topic returned by `listTopics('')` as a pill.
- **No first-run state.** With no grid defined, `Find` still offers scenes and highlight buttons that
  cannot succeed.
- **Copy leaks.** The nav kicker ("Reader-first shelf search") and the Manage blurb ("Keep the
  reader-facing experience simple") are internal design rationale shown to the user.
- **Inconsistent search.** `Find` debounces and has no submit button; `Manage > Books` still has a
  submit button and no debounce.
