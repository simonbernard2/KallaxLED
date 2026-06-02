from fastapi import APIRouter, HTTPException

import app.grids.deps as grids_deps
import app.lights.dtos as dtos
import app.strips.deps as strips_deps

router = APIRouter()


def _state_to_response(state) -> dtos.LightingStateResponse:
    return dtos.LightingStateResponse(
        highlight_box_id=state.highlight_box_id,
        highlight_rgb=state.highlight_rgb,
        active_scene=state.active_scene,
        scene_params=state.scene_params,
    )


def _collect_led_ids(grid) -> list[int]:
    led_ids: list[int] = []
    for box in grid.boxes:
        led_ids.extend(box.leds)
    return sorted(set(led_ids))


@router.get("/lights/state")
async def get_lighting_state(grid_repo: grids_deps.GridsRepoDep) -> dtos.LightingStateResponse:
    state = grid_repo.get_lighting_state()
    return _state_to_response(state)


@router.post("/lights/highlight")
async def highlight_box(
    request: dtos.HighlightRequest,
    grid_repo: grids_deps.GridsRepoDep,
    led_strip: strips_deps.LedStripDep,
) -> dtos.LightingStateResponse:
    box = grid_repo.get_box_by_id(request.box_id)
    if box is None:
        raise HTTPException(status_code=404, detail="box not found")

    state = grid_repo.set_highlight(box.id, list(request.rgb))
    led_strip.turn_off()
    if box.leds:
        led_strip.update_leds_by_ids(box.leds, request.rgb)
    return _state_to_response(state)


@router.post("/lights/clear")
async def clear_highlight(
    grid_repo: grids_deps.GridsRepoDep,
    led_strip: strips_deps.LedStripDep,
) -> dtos.LightingStateResponse:
    state = grid_repo.clear_highlight()
    # Only 'solid' can be restored from DB state; other scenes require a live animation loop.
    if state.active_scene == "solid":
        grid = grid_repo.get_grid()
        if grid is None:
            led_strip.turn_off()
            return _state_to_response(state)
        rgb = state.scene_params.get("rgb")
        if isinstance(rgb, (list, tuple)) and len(rgb) == 3:
            led_ids = _collect_led_ids(grid)
            led_strip.turn_off()
            if led_ids:
                led_strip.update_leds_by_ids(led_ids, (rgb[0], rgb[1], rgb[2]))
            return _state_to_response(state)
    led_strip.turn_off()
    return _state_to_response(state)


@router.post("/lights/scene")
async def set_scene(
    request: dtos.SceneRequest,
    grid_repo: grids_deps.GridsRepoDep,
    led_strip: strips_deps.LedStripDep,
) -> dtos.LightingStateResponse:
    allowed = {"off", "solid"}
    if request.name not in allowed:
        raise HTTPException(status_code=400, detail="unknown scene")

    if request.name == "off":
        state = grid_repo.set_scene(None, {})
        led_strip.turn_off()
        return _state_to_response(state)

    rgb = request.params.get("rgb")
    if not isinstance(rgb, (list, tuple)) or len(rgb) != 3:
        raise HTTPException(status_code=400, detail="solid scene requires params.rgb")
    grid = grid_repo.get_grid()
    if grid is None:
        raise HTTPException(status_code=404, detail="grid not found")
    led_ids = _collect_led_ids(grid)
    led_strip.turn_off()
    if led_ids:
        led_strip.update_leds_by_ids(led_ids, (rgb[0], rgb[1], rgb[2]))
    state = grid_repo.set_scene(request.name, request.params)
    return _state_to_response(state)
