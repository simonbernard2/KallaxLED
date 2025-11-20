from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.grid import GridType, BoxType, ConfigType

from app.strip import Strip

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of allowed origins
    allow_credentials=False,  # Allow cookies/authorization headers
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],  # Allow all headers
)
strip = Strip.default(number_of_leds=5)
leds = strip.leds()
grid = GridType(height=1, width=5, boxes=leds)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/status")
async def status() -> GridType:
    return grid


@app.get("/turn_off")
async def turn_off():
    try:
        strip.turn_off()
    except Exception as e:
        return {"status": "error", "error": e}
    return {"message": "ok"}


@app.post("/update_leds")
async def update_leds(data: GridType):
    for i in range(len(strip.pixels)):
        rgb = data.boxes[i].rgb

        strip.pixels[i] = (rgb.red, rgb.green, rgb.blue)
    strip.pixels.show()

    global grid
    grid = data
    return grid


@app.put("/update_led/{box_id}", response_model=GridType)
async def update_led(box_id: int, box: BoxType):
    for item in grid.boxes:
        if item.id == box_id:
            rgb = box.rgb

            item.rgb = box.rgb
            strip.pixels[item.id] = (rgb.red, rgb.green, rgb.blue)
            strip.pixels.show()
    return grid


@app.post("/update_config", response_model=GridType)
async def update_config(config: ConfigType):
    global strip
    strip = Strip.default(number_of_leds=(config.width * config.height))

    global grid
    grid.width = config.width
    grid.height = config.height
    grid.boxes = strip.leds()

    return grid
