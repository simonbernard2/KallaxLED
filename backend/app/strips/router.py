from fastapi import APIRouter
import app.strips.models as models
import app.strips.deps as deps


router = APIRouter()


@router.put("/leds/{led_id}")
async def update_led(
    led_id: int, color: models.Color, led_strip: deps.LedStripDep
) -> models.LED:
    led_strip.turn_off()
    led_strip.update_led(led_id, color)
    return models.LED(id=led_id, rgb=color.rgb)
