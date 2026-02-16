
def create_grid(client):
    response = client.post("/api/grid", json={"name": "Main", "width": 1, "height": 1})
    assert response.status_code == 200
    return response.json()


def test_highlight_box_updates_strip(client_with_stub):
    client, stub = client_with_stub
    grid = create_grid(client)
    box_id = grid["boxes"][0][0]["id"]

    assignments = {box_id: [1, 2]}
    response = client.put("/api/grid/leds", json=assignments)
    assert response.status_code == 200

    highlight_response = client.post(
        "/api/lights/highlight",
        json={"box_id": box_id, "rgb": [10, 20, 30]},
    )
    assert highlight_response.status_code == 200
    assert stub.off_calls == 1
    assert stub.last_update == ([1, 2], (10, 20, 30))
