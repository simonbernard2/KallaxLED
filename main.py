from app.strip import Strip
import time

if __name__ == "__main__":
    strip = Strip.default()
    try:
        strip.fade_in(0, (255, 0, 0))
        time.sleep(1)

    finally:
        strip.turn_off()
