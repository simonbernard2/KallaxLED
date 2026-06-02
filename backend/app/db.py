from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlmodel import create_engine

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB_NAME = "database.db"


def resolve_database_path(path: Path) -> Path:
    if path.suffix:
        return path.resolve()
    return (path / DEFAULT_DB_NAME).resolve()


def sqlite_url(db_path: Path) -> str:
    return f"sqlite:///{db_path}"


def create_sqlite_engine(db_path: Path, *, echo: bool = False):
    return create_engine(sqlite_url(db_path), echo=echo)


def run_migrations(db_path: Path) -> None:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_ROOT / "migrations"))
    config.set_main_option("sqlalchemy.url", sqlite_url(db_path))
    command.upgrade(config, "head")
