from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

import app.grids.deps as grids_deps
import app.lights.deps as lights_deps
import app.lights.dtos as dtos
import app.strips.deps as strips_deps
from app.grids.repo import GridFileRepo
from app.lights.animations import ANIMATIONS, build_geometry
from app.lights.engine import AnimationEngine
from app.strips.strip import Strip

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


def apply_scene(
    name: str | None,
    params: dict,
    grid_repo: GridFileRepo,
    led_strip: Strip,
    engine: AnimationEngine,
) -> None:
    """Drive the strip/engine for a scene, degrading to off on missing grid or bad params.

    Shared by scene changes, highlight clearing, and startup resume; persisted params are
    re-validated here so stale DB state can never crash the render loop.
    """
    engine.stop()
    if name is None or name == "off":
        led_strip.turn_off()
        return

    grid = grid_repo.get_grid()
    if grid is None:
        led_strip.turn_off()
        return

    if name == "solid":
        rgb = params.get("rgb")
        led_ids = _collect_led_ids(grid)
        led_strip.turn_off()
        if led_ids and isinstance(rgb, (list, tuple)) and len(rgb) == 3:
            led_strip.update_leds_by_ids(led_ids, (rgb[0], rgb[1], rgb[2]))
        return

    render = ANIMATIONS.get(name)
    param_model = dtos.ANIMATION_PARAM_MODELS.get(name)
    if render is None or param_model is None:
        led_strip.turn_off()
        return
    try:
        validated = param_model(**params).model_dump()
    except ValidationError:
        led_strip.turn_off()
        return
    geometry = build_geometry(grid, num_pixels=len(led_strip.pixels))
    if geometry is None:
        led_strip.turn_off()
        return
    engine.start(led_strip, geometry, render, validated)


@router.get("/lights/state")
async def get_lighting_state(grid_repo: grids_deps.GridsRepoDep) -> dtos.LightingStateResponse:
    state = grid_repo.get_lighting_state()
    return _state_to_response(state)


@router.post("/lights/highlight")
async def highlight_box(
    request: dtos.HighlightRequest,
    grid_repo: grids_deps.GridsRepoDep,
    led_strip: strips_deps.LedStripDep,
    engine: lights_deps.AnimationEngineDep,
) -> dtos.LightingStateResponse:
    box = grid_repo.get_box_by_id(request.box_id)
    if box is None:
        raise HTTPException(status_code=404, detail="box not found")

    engine.stop()
    state = grid_repo.set_highlight(request.box_id, list(request.rgb))
    led_strip.turn_off()
    if box.leds:
        led_strip.update_leds_by_ids(box.leds, request.rgb)
    return _state_to_response(state)


@router.post("/lights/clear")
async def clear_highlight(
    grid_repo: grids_deps.GridsRepoDep,
    led_strip: strips_deps.LedStripDep,
    engine: lights_deps.AnimationEngineDep,
) -> dtos.LightingStateResponse:
    state = grid_repo.clear_highlight()
    apply_scene(state.active_scene, state.scene_params, grid_repo, led_strip, engine)
    return _state_to_response(state)


@router.post("/lights/scene")
async def set_scene(
    request: dtos.SceneRequest,
    grid_repo: grids_deps.GridsRepoDep,
    led_strip: strips_deps.LedStripDep,
    engine: lights_deps.AnimationEngineDep,
) -> dtos.LightingStateResponse:
    allowed = {"off", "solid"} | set(ANIMATIONS)
    if request.name not in allowed:
        raise HTTPException(status_code=400, detail="unknown scene")

    if request.name == "off":
        engine.stop()
        state = grid_repo.set_scene(None, {})
        led_strip.turn_off()
        return _state_to_response(state)

    if request.name == "solid":
        rgb = request.params.get("rgb")
        if not isinstance(rgb, (list, tuple)) or len(rgb) != 3:
            raise HTTPException(status_code=400, detail="solid scene requires params.rgb")
    else:
        try:
            dtos.ANIMATION_PARAM_MODELS[request.name](**request.params)
        except ValidationError as exc:
            raise HTTPException(status_code=400, detail=f"invalid {request.name} params: {exc}")

    grid = grid_repo.get_grid()
    if grid is None:
        raise HTTPException(status_code=404, detail="grid not found")
    apply_scene(request.name, request.params, grid_repo, led_strip, engine)
    state = grid_repo.set_scene(request.name, request.params)
    return _state_to_response(state)
