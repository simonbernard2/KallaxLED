from __future__ import annotations

import re
from collections.abc import Iterable
from dataclasses import dataclass, field
from html.parser import HTMLParser
from urllib.parse import parse_qs, urljoin, urlparse

ARCHIVE_BASE_URL = "https://www.conjuringarchive.com"
ENTRY_ID_PATTERNS = (
    re.compile(r"/item/(\d+)"),
    re.compile(r"/entry/(\d+)"),
    re.compile(r"/list/entry/(\d+)"),
)


class ConjuringArchiveParseError(ValueError):
    pass


@dataclass
class ParsedArchiveEntry:
    title: str
    page: str | None
    creators: list[str] = field(default_factory=list)
    topic_paths: list[str] = field(default_factory=list)
    external_id: str | None = None
    summary: str | None = None


@dataclass
class ParsedArchivePublication:
    external_id: str
    source_url: str
    title: str
    subtitle: str | None = None
    authors: list[str] = field(default_factory=list)
    entries: list[ParsedArchiveEntry] = field(default_factory=list)


@dataclass
class HtmlNode:
    tag: str
    attrs: dict[str, str]
    children: list[HtmlNode | str] = field(default_factory=list)


class HtmlTreeBuilder(HTMLParser):
    VOID_TAGS = {"br", "img", "meta", "link", "hr", "input"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = HtmlNode("document", {})
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = HtmlNode(tag, {key: value or "" for key, value in attrs})
        self.stack[-1].children.append(node)
        if tag not in self.VOID_TAGS:
            self.stack.append(node)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        if data:
            self.stack[-1].children.append(data)


def normalize_archive_source(source: str) -> tuple[str, str]:
    value = source.strip()
    if not value:
        raise ConjuringArchiveParseError("archive source is required")

    if value.isdigit():
        external_id = value
        return external_id, f"{ARCHIVE_BASE_URL}/list/medium/{external_id}"

    parsed = urlparse(value)
    candidate = f"{parsed.path}?{parsed.query}" if parsed.query else parsed.path
    match = re.search(r"/list/medium/(\d+)", candidate)
    if match is None:
        raise ConjuringArchiveParseError("archive source must be a Conjuring Archive medium URL or numeric id")

    external_id = match.group(1)
    return external_id, f"{ARCHIVE_BASE_URL}/list/medium/{external_id}"


def parse_archive_publication_preview(html: str, external_id: str, source_url: str) -> ParsedArchivePublication:
    document = _parse_html(html)
    title = _extract_title(document)
    subtitle = _extract_subtitle(document)
    authors = _extract_authors(document, title)
    return ParsedArchivePublication(
        external_id=external_id,
        source_url=source_url,
        title=title,
        subtitle=subtitle,
        authors=authors,
    )


def parse_archive_publication(html: str, external_id: str, source_url: str) -> ParsedArchivePublication:
    publication = parse_archive_publication_preview(html, external_id, source_url)
    publication.entries = _extract_entries(_parse_html(html))
    return publication


def _parse_html(html: str) -> HtmlNode:
    parser = HtmlTreeBuilder()
    parser.feed(html)
    parser.close()
    return parser.root


def _normalize_text(text: str) -> str:
    return " ".join(text.replace("\xa0", " ").split())


def _node_text(node: HtmlNode | str) -> str:
    if isinstance(node, str):
        return _normalize_text(node)
    parts: list[str] = []
    for child in node.children:
        text = _node_text(child)
        if text:
            parts.append(text)
    return _normalize_text(" ".join(parts))


def _iter_nodes(node: HtmlNode, tag: str | None = None) -> Iterable[HtmlNode]:
    for child in node.children:
        if isinstance(child, str):
            continue
        if tag is None or child.tag == tag:
            yield child
        yield from _iter_nodes(child, tag)


def _find_first(node: HtmlNode, *tags: str) -> HtmlNode | None:
    tag_set = set(tags)
    for candidate in _iter_nodes(node):
        if candidate.tag in tag_set:
            return candidate
    return None


def _split_title_and_authors(text: str) -> tuple[str, list[str]]:
    cleaned = re.sub(r"\s*[-|]\s*Conjuring Archive$", "", text).strip()
    match = re.match(r"^(?P<title>.*?)(?:\s+\((?P<authors>[^()]*)\))?$", cleaned)
    if match is None:
        return cleaned, []
    title = (match.group("title") or cleaned).strip()
    raw_authors = (match.group("authors") or "").replace("*", "")
    authors = [part.strip() for part in raw_authors.split(",") if part.strip()]
    return title, authors


def _extract_title(document: HtmlNode) -> str:
    heading = _find_first(document, "h1")
    if heading is not None:
        title = _node_text(heading)
        if title:
            return title

    title_tag = _find_first(document, "title")
    if title_tag is None:
        raise ConjuringArchiveParseError("could not find publication title")

    title, _ = _split_title_and_authors(_node_text(title_tag))
    if not title:
        raise ConjuringArchiveParseError("could not parse publication title")
    return title


def _extract_subtitle(document: HtmlNode) -> str | None:
    for candidate in _iter_nodes(document):
        class_name = candidate.attrs.get("class", "")
        if "subtitle" not in class_name:
            continue
        subtitle = _node_text(candidate)
        if subtitle:
            return subtitle
    return None


def _extract_authors(document: HtmlNode, title: str) -> list[str]:
    for candidate in _iter_nodes(document):
        class_name = candidate.attrs.get("class", "")
        if "author" not in class_name:
            continue
        raw = _node_text(candidate)
        authors = [part.strip().replace("*", "") for part in raw.split(",") if part.strip()]
        if authors:
            return authors

    title_tag = _find_first(document, "title")
    if title_tag is not None:
        _, authors = _split_title_and_authors(_node_text(title_tag))
        if authors:
            return authors

    if " by " in title.lower():
        _, after = title.rsplit(" by ", 1)
        authors = [part.strip() for part in after.split(",") if part.strip()]
        if authors:
            return authors

    return []


def _table_has_entry_headers(table: HtmlNode) -> bool:
    headers = {_node_text(node).lower() for node in _iter_nodes(table, "th")}
    return {"title", "page", "categories"}.issubset(headers)


def _table_rows(table: HtmlNode) -> list[HtmlNode]:
    return [row for row in _iter_nodes(table, "tr")]


def _extract_cells(row: HtmlNode) -> list[HtmlNode]:
    cells: list[HtmlNode] = []
    for child in row.children:
        if isinstance(child, str):
            continue
        if child.tag in {"td", "th"}:
            cells.append(child)
    if cells:
        return cells
    return [cell for cell in _iter_nodes(row) if cell.tag in {"td", "th"}]


def _extract_topics_from_cell(cell: HtmlNode) -> list[str]:
    topic_paths: list[str] = []
    seen: set[str] = set()

    list_items = list(_iter_nodes(cell, "li"))
    sources = list_items if list_items else [cell]

    for source in sources:
        text = _node_text(source)
        if "/" not in text:
            continue
        segments = [_normalize_text(segment) for segment in text.split("/") if _normalize_text(segment)]
        if not segments:
            continue
        path = " / ".join(segments)
        if path not in seen:
            seen.add(path)
            topic_paths.append(path)

    return topic_paths


def _split_creators(text: str) -> list[str]:
    if not text:
        return []
    separators = ";" if ";" in text else ","
    return [part.strip() for part in text.split(separators) if part.strip()]


def _extract_entry_id(node: HtmlNode) -> str | None:
    for link in _iter_nodes(node, "a"):
        href = link.attrs.get("href", "")
        for pattern in ENTRY_ID_PATTERNS:
            match = pattern.search(href)
            if match is not None:
                return match.group(1)

        parsed = urlparse(urljoin(ARCHIVE_BASE_URL, href))
        highlight = parse_qs(parsed.query).get("highlight")
        if highlight:
            return highlight[0]

    return None


def _extract_entries(document: HtmlNode) -> list[ParsedArchiveEntry]:
    table = next(
        (candidate for candidate in _iter_nodes(document, "table") if _table_has_entry_headers(candidate)), None
    )
    if table is None:
        return []

    rows = _table_rows(table)
    entries: list[ParsedArchiveEntry] = []

    for row in rows[1:]:
        cells = _extract_cells(row)
        if len(cells) < 5:
            continue

        creators_text = _node_text(cells[0])
        title_text = _node_text(cells[1])
        page_text = _node_text(cells[3])
        topics = _extract_topics_from_cell(cells[4])
        if not title_text:
            continue

        entries.append(
            ParsedArchiveEntry(
                title=title_text,
                page=page_text or None,
                creators=_split_creators(creators_text),
                topic_paths=topics,
                external_id=_extract_entry_id(cells[1]),
            )
        )

    return entries
