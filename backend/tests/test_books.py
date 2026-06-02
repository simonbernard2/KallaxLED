
from pathlib import Path


def create_grid(client):
    response = client.post("/api/grid", json={"name": "Main", "width": 2, "height": 1})
    assert response.status_code == 200
    return response.json()


def test_book_search_partial(client_with_stub):
    client, _ = client_with_stub
    grid = create_grid(client)
    box_id = grid["boxes"][0][0]["id"]

    create_response = client.post(
        "/api/books",
        json={
            "title": "The Hobbit",
            "author": "J.R.R. Tolkien",
            "isbn": "978-0-261-10221-7",
            "tags": ["fantasy"],
            "box_id": box_id,
        },
    )
    assert create_response.status_code == 200

    search_response = client.get("/api/books", params={"query": "hob"})
    assert search_response.status_code == 200
    results = search_response.json()
    assert len(results) == 1
    assert results[0]["title"] == "The Hobbit"


def test_books_csv_import(client_with_stub):
    client, _ = client_with_stub
    create_grid(client)

    csv_content = "title,author,box_x,box_y\nDune,Frank Herbert,0,0\n"
    files = {"file": ("books.csv", csv_content, "text/csv")}
    response = client.post("/api/books/import", files=files)
    assert response.status_code == 200
    payload = response.json()
    assert payload["created"] == 1


def test_search_books_by_archive_topic(client_with_stubs):
    client, _, archive = client_with_stubs
    grid = create_grid(client)
    box_id = grid["boxes"][0][0]["id"]

    create_response = client.post(
        "/api/books",
        json={
            "title": "The Paper Engine",
            "author": "Aaron Fisher",
            "tags": ["magic"],
            "box_id": box_id,
        },
    )
    assert create_response.status_code == 200
    book_id = create_response.json()["id"]

    html = (Path(__file__).parent / "fixtures" / "conjuring_archive_medium_140.html").read_text()
    archive.register("https://www.conjuringarchive.com/list/medium/140", html)

    link_response = client.post(f"/api/books/{book_id}/archive-link", json={"source": "140"})
    assert link_response.status_code == 200
    assert link_response.json()["preview"]["title"] == "The Paper Engine"

    import_response = client.post(f"/api/books/{book_id}/archive-import")
    assert import_response.status_code == 200
    imported = import_response.json()
    assert imported["archive_publication"]["entry_count"] == 2

    search_response = client.get("/api/books/search", params={"query": "packet tricks"})
    assert search_response.status_code == 200
    results = search_response.json()
    assert len(results) == 1
    assert results[0]["title"] == "The Paper Engine"
    assert any(reason["type"] == "topic" for reason in results[0]["match_reasons"])

    shuffle_response = client.get("/api/books/search", params={"query": "false shuffle"})
    assert shuffle_response.status_code == 200
    shuffle_results = shuffle_response.json()
    assert len(shuffle_results) == 1
    assert any(reason["label"] == "False Shuffle" for reason in shuffle_results[0]["match_reasons"])

    topics_response = client.get("/api/topics", params={"query": "packet"})
    assert topics_response.status_code == 200
    topics = topics_response.json()
    assert topics[0]["name"] == "Packet Tricks"
