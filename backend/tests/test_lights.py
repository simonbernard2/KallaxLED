import numpy as np

from app.lights.deps import animation_engine


def create_grid(client, width: int = 1, height: int = 1):
    response = client.post("/api/grid", json={"name": "Main", "width": width, "height": height})
    assert response.status_code == 200
    return response.json()


def create_checker_grid(client):
    """2x2 grid with LED id = x + 2*y assigned to each box."""
    grid = create_grid(client, width=2, height=2)
    assignments = {}
    for row in grid["boxes"]:
        for box in row:
            assignments[box["id"]] = [box["x"] + 2 * box["y"]]
    response = client.put("/api/grid/leds", json=assignments)
    assert response.status_code == 200
    return grid


CHECKER_PARAMS = {"color_a": [255, 0, 0], "color_b": [0, 0, 255], "period_s": 0}


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


def test_animated_scene_starts_engine_and_writes_first_frame(client_with_stub):
    client, stub = client_with_stub
    create_checker_grid(client)

    response = client.post("/api/lights/scene", json={"name": "checkerboard", "params": CHECKER_PARAMS})

    assert response.status_code == 200
    body = response.json()
    assert body["active_scene"] == "checkerboard"
    assert body["scene_params"] == CHECKER_PARAMS
    assert animation_engine().is_running()
    frame = stub.frames[0]
    assert frame.shape == (150, 3)
    # parity of x+y: LEDs 0 and 3 are color_a, 1 and 2 are color_b
    np.testing.assert_array_equal(frame[0], [255, 0, 0])
    np.testing.assert_array_equal(frame[1], [0, 0, 255])
    np.testing.assert_array_equal(frame[2], [0, 0, 255])
    np.testing.assert_array_equal(frame[3], [255, 0, 0])
    np.testing.assert_array_equal(frame[4:], np.zeros((146, 3)))


def test_unknown_scene_and_bad_params_are_rejected(client_with_stub):
    client, _ = client_with_stub
    create_checker_grid(client)

    assert client.post("/api/lights/scene", json={"name": "disco"}).status_code == 400
    response = client.post("/api/lights/scene", json={"name": "checkerboard", "params": {"color_a": [255, 0, 0]}})
    assert response.status_code == 400
    assert not animation_engine().is_running()


def test_out_of_range_rgb_is_rejected_rather_than_crashing_the_lut(client_with_stub):
    client, _ = client_with_stub
    grid = create_checker_grid(client)
    box_id = grid["boxes"][0][0]["id"]

    # The gamma LUT has 256 entries, so an unbounded channel used to be an IndexError -> 500.
    assert client.post("/api/lights/highlight", json={"box_id": box_id, "rgb": [0, 0, 300]}).status_code == 422
    assert client.post("/api/lights/highlight", json={"box_id": box_id, "rgb": [-1, 0, 0]}).status_code == 422
    assert client.put("/api/leds/0", json={"rgb": [300, 0, 0]}).status_code == 422

    solid = client.post("/api/lights/scene", json={"name": "solid", "params": {"rgb": [300, 0, 0]}})
    assert solid.status_code == 400

    checker = client.post(
        "/api/lights/scene",
        json={"name": "checkerboard", "params": {"color_a": [0, 0, 0], "color_b": [0, 0, 999]}},
    )
    assert checker.status_code == 400


def test_solid_scene_lights_every_assigned_led(client_with_stub):
    client, stub = client_with_stub
    create_checker_grid(client)

    response = client.post("/api/lights/scene", json={"name": "solid", "params": {"rgb": [10, 20, 30]}})

    assert response.status_code == 200
    assert response.json()["active_scene"] == "solid"
    assert not animation_engine().is_running()
    assert stub.last_update == ([0, 1, 2, 3], (10, 20, 30))


def test_solid_scene_without_rgb_is_rejected(client_with_stub):
    client, _ = client_with_stub
    create_checker_grid(client)

    assert client.post("/api/lights/scene", json={"name": "solid", "params": {}}).status_code == 400


def test_animated_scene_without_grid_is_404(client_with_stub):
    client, _ = client_with_stub

    response = client.post("/api/lights/scene", json={"name": "rainbow", "params": {}})

    assert response.status_code == 404


def test_animated_scene_without_assigned_leds_turns_off(client_with_stub):
    client, stub = client_with_stub
    create_grid(client)

    response = client.post("/api/lights/scene", json={"name": "rainbow", "params": {}})

    assert response.status_code == 200
    assert response.json()["active_scene"] == "rainbow"
    assert not animation_engine().is_running()
    assert stub.off_calls == 1


def test_highlight_stops_animation_and_clear_restarts_it(client_with_stub):
    client, stub = client_with_stub
    grid = create_checker_grid(client)
    box_id = grid["boxes"][0][0]["id"]
    client.post("/api/lights/scene", json={"name": "checkerboard", "params": CHECKER_PARAMS})

    highlight = client.post("/api/lights/highlight", json={"box_id": box_id, "rgb": [10, 20, 30]})
    assert highlight.status_code == 200
    assert not animation_engine().is_running()
    assert stub.last_update == ([0], (10, 20, 30))

    frames_before_clear = len(stub.frames)
    clear = client.post("/api/lights/clear")
    assert clear.status_code == 200
    assert animation_engine().is_running()
    assert len(stub.frames) > frames_before_clear  # fresh t=0 frame written synchronously


def test_scene_off_stops_animation(client_with_stub):
    client, stub = client_with_stub
    create_checker_grid(client)
    client.post("/api/lights/scene", json={"name": "swipe", "params": {"rgb": [0, 255, 0]}})
    assert animation_engine().is_running()

    response = client.post("/api/lights/scene", json={"name": "off"})

    assert response.status_code == 200
    assert not animation_engine().is_running()
    assert stub.off_calls >= 1
