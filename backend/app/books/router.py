import csv
import io
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Response

from app.archive import (
    ConjuringArchiveParseError,
    normalize_archive_source,
    parse_archive_publication,
    parse_archive_publication_preview,
)
import app.archive.deps as archive_deps
from app.archive.fetcher import ArchiveFetchError
import app.books.dtos as dtos
import app.grids.deps as deps
import app.grids.models as models

router = APIRouter()


@router.post("/books")
async def create_book(book_data: dtos.BookCreate, grid_repo: deps.GridsRepoDep) -> dtos.BookResponse:
    if book_data.box_id is not None and grid_repo.get_box_by_id(book_data.box_id) is None:
        raise HTTPException(status_code=400, detail="box not found")
    book = grid_repo.create_book(book_data.to_model())
    return dtos.BookResponse.from_book(book)


@router.get("/books")
async def search_books(
    grid_repo: deps.GridsRepoDep,
    query: Optional[str] = None,
) -> list[dtos.BookResponse]:
    books = grid_repo.search_books(query)
    return [dtos.BookResponse.from_book(book) for book in books]


@router.get("/books/search")
async def search_books_with_context(
    grid_repo: deps.GridsRepoDep,
    query: Optional[str] = None,
) -> list[dtos.BookSearchResponse]:
    matches = grid_repo.search_book_matches(query)
    return [dtos.BookSearchResponse.from_match(match) for match in matches]


@router.put("/books/{book_id}")
async def update_book(
    book_id: int,
    book_data: dtos.BookUpdate,
    grid_repo: deps.GridsRepoDep,
) -> dtos.BookResponse:
    updates = book_data.model_dump(exclude_unset=True)
    if "box_id" in updates and updates["box_id"] is not None:
        if grid_repo.get_box_by_id(updates["box_id"]) is None:
            raise HTTPException(status_code=400, detail="box not found")
    book = grid_repo.update_book(book_id, updates)
    if book is None:
        raise HTTPException(status_code=404, detail="book not found")
    return dtos.BookResponse.from_book(book)


@router.delete("/books/{book_id}")
async def delete_book(book_id: int, grid_repo: deps.GridsRepoDep) -> dtos.BookResponse:
    book = grid_repo.delete_book(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="book not found")
    return dtos.BookResponse.from_book(book)


@router.post("/books/{book_id}/archive-link")
async def link_book_archive(
    book_id: int,
    payload: dtos.ArchiveLinkRequest,
    grid_repo: deps.GridsRepoDep,
    archive_fetcher: archive_deps.ArchiveFetcherDep,
) -> dtos.ArchiveLinkResponse:
    try:
        external_id, source_url = normalize_archive_source(payload.source)
        html = archive_fetcher.fetch(source_url)
        publication = parse_archive_publication_preview(html, external_id, source_url)
    except ConjuringArchiveParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ArchiveFetchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    book = grid_repo.link_book_to_archive(book_id, publication)
    if book is None:
        raise HTTPException(status_code=404, detail="book not found")

    return dtos.ArchiveLinkResponse(
        preview=dtos.ArchiveLinkPreview.from_publication(publication),
        book=dtos.BookResponse.from_book(book),
    )


@router.post("/books/{book_id}/archive-import")
async def import_book_archive(
    book_id: int,
    grid_repo: deps.GridsRepoDep,
    archive_fetcher: archive_deps.ArchiveFetcherDep,
) -> dtos.BookResponse:
    book = grid_repo.get_book(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="book not found")
    if book.archive_publication is None:
        raise HTTPException(status_code=400, detail="book is not linked to an archive publication")

    try:
        html = archive_fetcher.fetch(book.archive_publication.source_url)
        publication = parse_archive_publication(
            html,
            book.archive_publication.external_id,
            book.archive_publication.source_url,
        )
    except ConjuringArchiveParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ArchiveFetchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    imported_book = grid_repo.import_archive_publication(book_id, publication)
    if imported_book is None:
        raise HTTPException(status_code=404, detail="book not found")
    return dtos.BookResponse.from_book(imported_book)


@router.post("/books/import")
async def import_books(grid_repo: deps.GridsRepoDep, file: UploadFile = File(...)) -> dtos.BookImportResult:
    if file.content_type not in {"text/csv", "application/vnd.ms-excel", "application/csv", "text/plain"}:
        raise HTTPException(status_code=400, detail="unsupported file type")

    content = await file.read()
    try:
        decoded = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="file must be utf-8")

    reader = csv.DictReader(io.StringIO(decoded))
    if reader.fieldnames is None:
        raise HTTPException(status_code=400, detail="missing CSV headers")

    required = {"title", "author", "box_x", "box_y"}
    missing = required.difference({name.strip() for name in reader.fieldnames})
    if missing:
        raise HTTPException(status_code=400, detail=f"missing columns: {', '.join(sorted(missing))}")

    created = 0
    skipped = 0
    errors: list[str] = []

    for index, row in enumerate(reader, start=2):
        title = (row.get("title") or "").strip()
        author = (row.get("author") or "").strip()
        if not title or not author:
            skipped += 1
            errors.append(f"row {index}: missing title or author")
            continue

        try:
            x = int((row.get("box_x") or "").strip())
            y = int((row.get("box_y") or "").strip())
        except ValueError:
            skipped += 1
            errors.append(f"row {index}: invalid box_x/box_y")
            continue

        box = grid_repo.get_box_by_coords(x, y)
        if box is None or box.id is None:
            skipped += 1
            errors.append(f"row {index}: no box at {x},{y}")
            continue

        isbn = (row.get("isbn") or "").strip() or None
        tags_value = (row.get("tags") or "").strip()
        tags: list[str] = []
        if tags_value:
            separator = ";" if ";" in tags_value else ","
            tags = [tag.strip() for tag in tags_value.split(separator) if tag.strip()]

        notes = (row.get("notes") or "").strip() or None
        book = models.Book(title=title, author=author, isbn=isbn, user_tags=tags, notes=notes, box_id=box.id)
        grid_repo.create_book(book)
        created += 1

    return dtos.BookImportResult(created=created, skipped=skipped, errors=errors)


@router.get("/books/export")
async def export_books(grid_repo: deps.GridsRepoDep) -> Response:
    books = grid_repo.list_books()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["title", "author", "isbn", "tags", "notes", "box_x", "box_y", "archive_url"])
    for book in books:
        box_x = book.box.x if book.box is not None else ""
        box_y = book.box.y if book.box is not None else ""
        tags = ";".join(book.user_tags)
        archive_url = book.archive_publication.source_url if book.archive_publication is not None else ""
        writer.writerow([book.title, book.author, book.isbn or "", tags, book.notes or "", box_x, box_y, archive_url])

    content = output.getvalue()
    headers = {"Content-Disposition": "attachment; filename=books.csv"}
    return Response(content=content, media_type="text/csv", headers=headers)


@router.get("/topics")
async def list_topics(grid_repo: deps.GridsRepoDep, query: Optional[str] = None) -> list[dtos.TopicResponse]:
    topics = grid_repo.list_topics(query)
    return [dtos.TopicResponse.from_topic(topic) for topic in topics]
