from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.archive.parser import ParsedArchivePublication
from app.grids.models import ArchivePublication, ArchiveEntry, Book, Box, MagicTopic
from app.grids.repo import BookMatchReason, BookSearchMatch


class BoxRef(BaseModel):
    id: int
    x: int
    y: int

    @staticmethod
    def from_box(box: Box) -> "BoxRef":
        if box.id is None:
            raise Exception("no box id")
        return BoxRef(id=box.id, x=box.x, y=box.y)


class TopicResponse(BaseModel):
    id: int
    name: str
    path: str

    @staticmethod
    def from_topic(topic: MagicTopic) -> "TopicResponse":
        if topic.id is None:
            raise Exception("no topic id")
        return TopicResponse(id=topic.id, name=topic.name, path=topic.path)


class ArchiveEntryPreview(BaseModel):
    id: int
    title: str
    page: str | None = None

    @staticmethod
    def from_entry(entry: ArchiveEntry) -> "ArchiveEntryPreview":
        if entry.id is None:
            raise Exception("no entry id")
        return ArchiveEntryPreview(id=entry.id, title=entry.title, page=entry.page)


class ArchivePublicationSummary(BaseModel):
    id: int
    external_id: str
    source_url: str
    title: str
    subtitle: str | None = None
    authors: list[str]
    imported_at: datetime | None = None
    entry_count: int
    topics_preview: list[TopicResponse]
    entries_preview: list[ArchiveEntryPreview]

    @staticmethod
    def from_publication(publication: ArchivePublication) -> "ArchivePublicationSummary":
        if publication.id is None:
            raise Exception("no publication id")

        topics_by_path: dict[str, MagicTopic] = {}
        for entry in publication.entries:
            for link in entry.topic_links:
                topic = link.topic
                if topic is None:
                    continue
                topics_by_path[topic.path] = topic

        sorted_topics = sorted(topics_by_path.values(), key=lambda topic: topic.path.lower())
        sorted_entries = sorted(publication.entries, key=lambda entry: (entry.page or "", entry.title.lower()))

        return ArchivePublicationSummary(
            id=publication.id,
            external_id=publication.external_id,
            source_url=publication.source_url,
            title=publication.title,
            subtitle=publication.subtitle,
            authors=publication.authors,
            imported_at=publication.imported_at,
            entry_count=len(publication.entries),
            topics_preview=[TopicResponse.from_topic(topic) for topic in sorted_topics[:8]],
            entries_preview=[ArchiveEntryPreview.from_entry(entry) for entry in sorted_entries[:5]],
        )


class BookCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    author: str
    isbn: str | None = None
    user_tags: list[str] = Field(default_factory=list, alias="tags")
    notes: str | None = None
    box_id: int | None = None

    def to_model(self) -> Book:
        return Book(
            title=self.title,
            author=self.author,
            isbn=self.isbn,
            user_tags=self.user_tags,
            notes=self.notes,
            box_id=self.box_id,
        )


class BookUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str | None = None
    author: str | None = None
    isbn: str | None = None
    user_tags: list[str] | None = Field(default=None, alias="tags")
    notes: str | None = None
    box_id: int | None = None


class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    isbn: str | None = None
    user_tags: list[str]
    notes: str | None = None
    box: BoxRef | None = None
    archive_publication: ArchivePublicationSummary | None = None

    @staticmethod
    def from_book(book: Book) -> "BookResponse":
        if book.id is None:
            raise Exception("no book id")
        box_ref = BoxRef.from_box(book.box) if book.box is not None else None
        publication = (
            ArchivePublicationSummary.from_publication(book.archive_publication)
            if book.archive_publication is not None
            else None
        )
        return BookResponse(
            id=book.id,
            title=book.title,
            author=book.author,
            isbn=book.isbn,
            user_tags=book.user_tags,
            notes=book.notes,
            box=box_ref,
            archive_publication=publication,
        )


class MatchReasonResponse(BaseModel):
    type: str
    label: str
    detail: str | None = None

    @staticmethod
    def from_reason(reason: BookMatchReason) -> "MatchReasonResponse":
        return MatchReasonResponse(type=reason.type, label=reason.label, detail=reason.detail)


class BookSearchResponse(BookResponse):
    match_reasons: list[MatchReasonResponse]

    @staticmethod
    def from_match(match: BookSearchMatch) -> "BookSearchResponse":
        return BookSearchResponse(
            **BookResponse.from_book(match.book).model_dump(),
            match_reasons=[MatchReasonResponse.from_reason(reason) for reason in match.reasons],
        )


class PagedBooksResponse(BaseModel):
    """One page of books plus the total match count, so callers can render "showing N of M"."""

    items: list[BookResponse]
    total: int
    limit: int
    offset: int


class PagedBookSearchResponse(BaseModel):
    items: list[BookSearchResponse]
    total: int
    limit: int
    offset: int


class ArchiveLinkRequest(BaseModel):
    source: str


class ArchiveLinkPreview(BaseModel):
    external_id: str
    source_url: str
    title: str
    subtitle: str | None = None
    authors: list[str]

    @staticmethod
    def from_publication(publication: ParsedArchivePublication) -> "ArchiveLinkPreview":
        return ArchiveLinkPreview(
            external_id=publication.external_id,
            source_url=publication.source_url,
            title=publication.title,
            subtitle=publication.subtitle,
            authors=publication.authors,
        )


class ArchiveLinkResponse(BaseModel):
    preview: ArchiveLinkPreview
    book: BookResponse


class BookImportResult(BaseModel):
    created: int
    skipped: int
    errors: list[str]
