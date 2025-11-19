from fastapi import FastAPI
from app.grid import BoxType, GridType

from app.strip import Strip

app = FastAPI()

strip = Strip.default(number_of_leds=5)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/status")
async def status() -> list[BoxType]:
    return strip.leds()


@app.get("/turn_off")
async def turn_off():
    try:
        strip.turn_off()
    except Exception as e:
        return {"status": "error", "error": e}
    return {"message": "ok"}


@app.post("/update_leds")
async def update_leds(grid: GridType):
    for i in range(len(strip.pixels)):
        rgb = grid.boxes[i].rgb

        strip.transition_single_led(i, (rgb.red, rgb.green, rgb.blue))
    strip.pixels.show()
    return grid


if __name__ == "__main__":
    strip = Strip.default()
    try:
        # strip.transition([0], (0, 0, 0))
        # strip.swipe(range(25), (255, 0, 0), 2005)
        while True:
            strip.bullet(range(8, 2, -1), (255, 0, 0), speed_ms=2500, width=2)

    finally:
        strip.turn_off()
