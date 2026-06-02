from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from app.archive.fetcher import ArchiveFetcher


@lru_cache
def archive_fetcher() -> ArchiveFetcher:
    return ArchiveFetcher()


ArchiveFetcherDep = Annotated[ArchiveFetcher, Depends(archive_fetcher)]
