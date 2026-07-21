def create_grid(client, width=2, height=2):
    response = client.post("/api/grid", json={"name": "Main", "width": width, "height": height})
    assert response.status_code == 200
    return response.json()


def test_grid_resize_preserves_existing_boxes_and_adds_new_ones(client_with_stub):
    client, _ = client_with_stub
    grid = create_grid(client, width=2, height=1)
    original_box_id = grid["boxes"][0][0]["id"]

    response = client.put("/api/grid", json={"name": "Expanded", "width": 3, "height": 2})
    assert response.status_code == 200

    payload = response.json()
    assert payload["name"] == "Expanded"
    assert payload["width"] == 3
    assert payload["height"] == 2
    assert payload["boxes"][0][0]["id"] == original_box_id
    assert payload["boxes"][1][2]["x"] == 2
    assert payload["boxes"][1][2]["y"] == 1
    assert payload["boxes"][1][2]["leds"] == []


def test_grid_resize_shrinks_safely_and_unassigns_removed_boxes(client_with_stub):
    client, _ = client_with_stub
    grid = create_grid(client, width=2, height=2)
    removed_box_id = grid["boxes"][1][1]["id"]

    create_book_response = client.post(
        "/api/books",
        json={"title": "Misplaced", "author": "Test", "tags": ["demo"], "box_id": removed_box_id},
    )
    assert create_book_response.status_code == 200

    highlight_response = client.post("/api/lights/highlight", json={"box_id": removed_box_id, "rgb": [255, 207, 125]})
    assert highlight_response.status_code == 200
    assert highlight_response.json()["highlight_box_id"] == removed_box_id

    resize_response = client.put("/api/grid", json={"name": "Shrunk", "width": 1, "height": 1})
    assert resize_response.status_code == 200

    resized = resize_response.json()
    assert resized["name"] == "Shrunk"
    assert resized["width"] == 1
    assert resized["height"] == 1
    assert len(resized["boxes"]) == 1
    assert len(resized["boxes"][0]) == 1

    books_response = client.get("/api/books")
    assert books_response.status_code == 200
    books = books_response.json()["items"]
    assert len(books) == 1
    assert books[0]["title"] == "Misplaced"
    assert books[0]["box"] is None

    lighting_state_response = client.get("/api/lights/state")
    assert lighting_state_response.status_code == 200
    assert lighting_state_response.json()["highlight_box_id"] is None
    assert lighting_state_response.json()["highlight_rgb"] is None
