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

## Frontend

- React Router v7 + Vite under [`frontend`](./frontend).
- Responsive web-first UI with a warm library-inspired visual system.
- Shared API client in [`frontend/app/utils/api.ts`](./frontend/app/utils/api.ts).

## Roadmap

1. Stabilize archive parsing against more real publication fixtures.
2. Add richer filtering and topic autocomplete in `Find`.
3. Add personal archive overrides and annotations beyond simple local tags/notes.
4. Build a Raycast extension on top of the same search and highlight endpoints.
