from pathlib import Path

from app.archive.parser import normalize_archive_source, parse_archive_publication, parse_archive_publication_preview


def test_parse_archive_publication_fixture():
    html = (Path(__file__).parent / "fixtures" / "conjuring_archive_medium_140.html").read_text()
    external_id, source_url = normalize_archive_source(
        "https://www.conjuringarchive.com/list/medium/140?highlight=8774"
    )

    preview = parse_archive_publication_preview(html, external_id, source_url)
    assert preview.title == "The Paper Engine"
    assert preview.authors == ["Aaron Fisher", "John Lovick"]

    publication = parse_archive_publication(html, external_id, source_url)
    assert len(publication.entries) == 2
    assert publication.entries[0].title == "Search and Destroy"
    assert "Cards / Packet Tricks" in publication.entries[0].topic_paths
    assert publication.entries[1].topic_paths == ["Cards / Sleights / Passes"]
