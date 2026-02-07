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
    led_strip.turn_off()
    return _state_to_response(state)
