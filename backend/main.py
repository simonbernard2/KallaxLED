import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.books.router import router as books_router
from app.strips.router import router as strips_router
from app.grids.router import router as grids_router
from app.lights.router import router as lights_router

app = FastAPI()
logger = logging.getLogger("uvicorn.error")
api_prefix = "/api"
app.include_router(strips_router, prefix=api_prefix)
app.include_router(grids_router, prefix=api_prefix)
app.include_router(books_router, prefix=api_prefix)
app.include_router(lights_router, prefix=api_prefix)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of allowed origins
    allow_credentials=False,  # Allow cookies/authorization headers
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],  # Allow all headers
)


@app.middleware("http")
async def log_unhandled_request_errors(request, call_next):
    origin = request.headers.get("origin")
    logger.info("HTTP %s %s origin=%s", request.method, request.url.path, origin or "-")
    try:
        response = await call_next(request)
    except Exception as exc:  # pragma: no cover - defensive logging middleware
        logger.exception("Unhandled request error on %s %s", request.method, request.url.path)
        response = JSONResponse(status_code=500, content={"detail": str(exc)})

    if origin and "access-control-allow-origin" not in response.headers:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"

    logger.info("HTTP %s %s -> %s", request.method, request.url.path, response.status_code)
    return response
