import logging

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.books.router import router as books_router
from app.strips.router import router as strips_router
from app.grids.router import router as grids_router
from app.lights.router import router as lights_router

app = FastAPI()
logger = logging.getLogger("kallaxled.api")
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
    try:
        return await call_next(request)
    except Exception as exc:  # pragma: no cover - defensive logging middleware
        logger.exception("Unhandled request error on %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": str(exc)})
