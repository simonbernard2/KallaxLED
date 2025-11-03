from app.strip import Strip
import time

if __name__ == "__main__":
    strip = Strip.default()
    try:
        # strip.transition(0, (0, 0, 0))
        while True:
            strip.transition(0, (255, 0, 0), 10)
            strip.transition(0, (0, 0, 100), 20)
            strip.transition(0, (0, 100, 0), 30)

    finally:
        strip.turn_off()
