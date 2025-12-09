from app.strips.strip import Strip
from app.strips.models import StripAnimation
import time


class StripService:
    def __init__(self, strip: Strip) -> None:
        self.strip = strip

    def animate(self, animation: StripAnimation) -> None:
        # do it in thread with locks, etc.
        self.strip.turn_off()
        for step in animation.steps:
            self.strip.update_leds(step.leds)
            time.sleep(step.delay_ms / 1000)
