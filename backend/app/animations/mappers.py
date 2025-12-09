from app.strips.models import StripAnimation, StripAnimationStep, LED
from app.grids.models import Grid
import app.animations.models as models


def to_strip_animation(grid: Grid, animation: models.Animation) -> StripAnimation:
    steps = [to_strip_step(grid, s) for s in animation.steps]
    return StripAnimation(steps=steps)


def to_strip_step(grid: Grid, step: models.AnimationStep) -> StripAnimationStep:
    leds = []
    for e in step.events:
        leds += to_leds(grid, e)

    return StripAnimationStep(leds=leds, delay_ms=step.delay_ms)


def to_leds(grid: Grid, e: models.BoxEvent) -> list[LED]:
    box_leds = grid.boxes[e.i][e.j].leds

    return [LED(id=led.id, rgb=e.rgb) for led in box_leds]
