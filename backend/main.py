import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.books.router import router as books_router
from app.errors import DomainError
from app.grids.deps import grid_repo
from app.grids.router import router as grids_router
from app.lights.deps import animation_engine
from app.lights.router import apply_scene
from app.lights.router import router as lights_router
from app.strips.deps import led_strip
from app.strips.router import router as strips_router

logger = logging.getLogger("uvicorn.error")


def _resume_persisted_scene() -> None:
    # Read state first so a fresh DB never instantiates the strip or engine.
    state = grid_repo().get_lighting_state()
    if state.active_scene is None:
        return
    logger.info("Resuming persisted scene %r", state.active_scene)
    apply_scene(state.active_scene, state.scene_params, grid_repo(), led_strip(), animation_engine())


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        _resume_persisted_scene()
    except Exception:  # pragma: no cover - startup must never fail on bad persisted state
        logger.exception("Failed to resume persisted scene on startup")
    yield
    animation_engine().stop()


app = FastAPI(lifespan=lifespan)
api_prefix = "/api"
app.include_router(strips_router, prefix=api_prefix)
app.include_router(grids_router, prefix=api_prefix)
app.include_router(books_router, prefix=api_prefix)
app.include_router(lights_router, prefix=api_prefix)


@app.exception_handler(DomainError)
async def handle_domain_error(_request: Request, exc: DomainError) -> JSONResponse:
    # Starlette matches handlers along the exception's MRO, so this one registration covers every
    # DomainError subclass. It runs inside ExceptionMiddleware — i.e. inside the HTTP middleware
    # below — so the blanket 500 there only ever sees genuinely unhandled errors.
    return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})


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
