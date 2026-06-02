from __future__ import annotations

from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class ArchiveFetchError(RuntimeError):
    pass


class ArchiveFetcher:
    def fetch(self, source_url: str) -> str:
        request = Request(
            source_url,
            headers={
                "User-Agent": "KallaxLED/0.1 (+https://www.conjuringarchive.com/)",
            },
        )
        try:
            with urlopen(request, timeout=10) as response:
                return response.read().decode("utf-8")
        except HTTPError as exc:
            raise ArchiveFetchError(f"archive returned HTTP {exc.code}") from exc
        except URLError as exc:
            raise ArchiveFetchError("archive is currently unreachable") from exc
