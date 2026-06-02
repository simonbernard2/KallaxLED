"""reader-first schema

Revision ID: 0001_reader_first_schema
Revises:
Create Date: 2026-04-01 21:15:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_reader_first_schema"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_names() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names())


def upgrade() -> None:
    existing_tables = _table_names()

    if "grid" not in existing_tables:
        op.create_table(
            "grid",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    if "box" not in existing_tables:
        op.create_table(
            "box",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("x", sa.Integer(), nullable=False),
            sa.Column("y", sa.Integer(), nullable=False),
            sa.Column("leds", sa.JSON(), nullable=True),
            sa.Column("grid_id", sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(["grid_id"], ["grid.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "lightingstate" not in existing_tables:
        op.create_table(
            "lightingstate",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("highlight_box_id", sa.Integer(), nullable=True),
            sa.Column("highlight_rgb", sa.JSON(), nullable=True),
            sa.Column("active_scene", sa.String(), nullable=True),
            sa.Column("scene_params", sa.JSON(), nullable=True),
            sa.ForeignKeyConstraint(["highlight_box_id"], ["box.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "archive_publications" not in existing_tables:
        op.create_table(
            "archive_publications",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("external_id", sa.String(), nullable=False),
            sa.Column("source_url", sa.String(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("subtitle", sa.String(), nullable=True),
            sa.Column("authors", sa.JSON(), nullable=True),
            sa.Column("imported_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("external_id"),
        )
        op.create_index(op.f("ix_archive_publications_external_id"), "archive_publications", ["external_id"], unique=True)

    if "magic_topics" not in existing_tables:
        op.create_table(
            "magic_topics",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("path", sa.String(), nullable=False),
            sa.Column("parent_path", sa.String(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("path"),
        )
        op.create_index(op.f("ix_magic_topics_name"), "magic_topics", ["name"], unique=False)
        op.create_index(op.f("ix_magic_topics_path"), "magic_topics", ["path"], unique=True)

    if "library_books" not in existing_tables:
        op.create_table(
            "library_books",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("author", sa.String(), nullable=False),
            sa.Column("isbn", sa.String(), nullable=True),
            sa.Column("user_tags", sa.JSON(), nullable=True),
            sa.Column("notes", sa.String(), nullable=True),
            sa.Column("box_id", sa.Integer(), nullable=True),
            sa.Column("archive_publication_id", sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(["archive_publication_id"], ["archive_publications.id"]),
            sa.ForeignKeyConstraint(["box_id"], ["box.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "archive_entries" not in existing_tables:
        op.create_table(
            "archive_entries",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("publication_id", sa.Integer(), nullable=False),
            sa.Column("external_id", sa.String(), nullable=True),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("page", sa.String(), nullable=True),
            sa.Column("creators", sa.JSON(), nullable=True),
            sa.Column("summary", sa.String(), nullable=True),
            sa.ForeignKeyConstraint(["publication_id"], ["archive_publications.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_archive_entries_external_id"), "archive_entries", ["external_id"], unique=False)
        op.create_index(op.f("ix_archive_entries_publication_id"), "archive_entries", ["publication_id"], unique=False)

    if "archive_entry_topic_links" not in existing_tables:
        op.create_table(
            "archive_entry_topic_links",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("entry_id", sa.Integer(), nullable=False),
            sa.Column("topic_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["entry_id"], ["archive_entries.id"]),
            sa.ForeignKeyConstraint(["topic_id"], ["magic_topics.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_archive_entry_topic_links_entry_id"),
            "archive_entry_topic_links",
            ["entry_id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_archive_entry_topic_links_topic_id"),
            "archive_entry_topic_links",
            ["topic_id"],
            unique=False,
        )

    if "book" in existing_tables:
        op.execute(
            """
            INSERT INTO library_books (id, title, author, isbn, user_tags, notes, box_id, archive_publication_id)
            SELECT id, title, author, isbn, tags, NULL, box_id, NULL
            FROM book
            WHERE id NOT IN (SELECT id FROM library_books)
            """
        )
        op.drop_table("book")


def downgrade() -> None:
    existing_tables = _table_names()

    if "library_books" in existing_tables and "book" not in existing_tables:
        op.create_table(
            "book",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("author", sa.String(), nullable=False),
            sa.Column("isbn", sa.String(), nullable=True),
            sa.Column("tags", sa.JSON(), nullable=True),
            sa.Column("box_id", sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(["box_id"], ["box.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.execute(
            """
            INSERT INTO book (id, title, author, isbn, tags, box_id)
            SELECT id, title, author, isbn, user_tags, box_id
            FROM library_books
            """
        )

    if "archive_entry_topic_links" in existing_tables:
        op.drop_index(op.f("ix_archive_entry_topic_links_topic_id"), table_name="archive_entry_topic_links")
        op.drop_index(op.f("ix_archive_entry_topic_links_entry_id"), table_name="archive_entry_topic_links")
        op.drop_table("archive_entry_topic_links")
    if "archive_entries" in existing_tables:
        op.drop_index(op.f("ix_archive_entries_publication_id"), table_name="archive_entries")
        op.drop_index(op.f("ix_archive_entries_external_id"), table_name="archive_entries")
        op.drop_table("archive_entries")
    if "library_books" in existing_tables:
        op.drop_table("library_books")
    if "magic_topics" in existing_tables:
        op.drop_index(op.f("ix_magic_topics_path"), table_name="magic_topics")
        op.drop_index(op.f("ix_magic_topics_name"), table_name="magic_topics")
        op.drop_table("magic_topics")
    if "archive_publications" in existing_tables:
        op.drop_index(op.f("ix_archive_publications_external_id"), table_name="archive_publications")
        op.drop_table("archive_publications")
