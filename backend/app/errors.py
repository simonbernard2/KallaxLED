"""Domain errors that carry their own HTTP status.

Routers raise (or let through) these instead of catching bare `Exception` and guessing a status
code. `main.py` registers a single handler for `DomainError`; Starlette resolves exception handlers
by walking `type(exc).__mro__`, so every subclass below is covered by that one registration.

Only use these for errors the *client* caused. An invariant the code itself broke — a committed row
with a `None` primary key, say — is a `RuntimeError` and should stay a 500.
"""


class DomainError(Exception):
    status_code: int = 400


class InvalidRequestError(DomainError):
    status_code = 400


class NotFoundError(DomainError):
    status_code = 404


class ConflictError(DomainError):
    status_code = 409
