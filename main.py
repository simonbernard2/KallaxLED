from app.strip import Strip
import time

if __name__ == "__main__":
    strip = Strip.default()
    try:
        # strip.transition([0], (0, 0, 0))
        # strip.swipe(range(25), (255, 0, 0), 2005)
        while True:
            strip.bullet(range(8, 2, -1), (255, 0, 0), speed_ms=2500, width=2)

    finally:
        strip.turn_off()
