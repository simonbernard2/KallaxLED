from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.books.router import router as books_router
from app.strips.router import router as strips_router
from app.grids.router import router as grids_router
from app.lights.router import router as lights_router

app = FastAPI()
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
