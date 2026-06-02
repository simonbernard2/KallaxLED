from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from app.grids.repo import GridFileRepo


def test_existing_books_migrate_to_library_books(tmp_path):
    db_dir = tmp_path / "db"
    db_dir.mkdir()
    db_path = db_dir / "database.db"

    with sqlite3.connect(db_path) as connection:
        connection.execute("CREATE TABLE grid (id INTEGER PRIMARY KEY, name TEXT NOT NULL)")
        connection.execute(
            "CREATE TABLE box (id INTEGER PRIMARY KEY, x INTEGER NOT NULL, y INTEGER NOT NULL, leds JSON, grid_id INTEGER)"
        )
        connection.execute(
            """
            CREATE TABLE book (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT,
                tags JSON,
                box_id INTEGER
            )
            """
        )
        connection.execute("INSERT INTO grid (id, name) VALUES (1, 'Main')")
        connection.execute("INSERT INTO box (id, x, y, leds, grid_id) VALUES (10, 0, 0, '[]', 1)")
        connection.execute(
            "INSERT INTO book (id, title, author, isbn, tags, box_id) VALUES (?, ?, ?, ?, ?, ?)",
            (5, "Expert Card Technique", "Hugard", "123", json.dumps(["false shuffles", "cards"]), 10),
        )
        connection.commit()

    repo = GridFileRepo(db_dir)
    books = repo.list_books()

    assert len(books) == 1
    assert books[0].title == "Expert Card Technique"
    assert books[0].user_tags == ["false shuffles", "cards"]
    assert books[0].box is not None
    assert books[0].box.id == 10

    with sqlite3.connect(db_path) as connection:
        tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert "library_books" in tables
    assert "archive_publications" in tables
    assert "book" not in tables
