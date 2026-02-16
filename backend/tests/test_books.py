
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
