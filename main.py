from app.strip import Strip
import time

if __name__ == "__main__":
    strip = Strip.default()
    try:
        # strip.transition(0, (0, 0, 0))
        while True:
            strip.transition([1, 2, 3, 4, 5], (255, 0, 0), 200)

    finally:
        strip.turn_off()
