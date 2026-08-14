import logging
import threading
import time

import numpy as np

from app.lights.animations import AnimationFn, StripGeometry

logger = logging.getLogger(__name__)


class AnimationEngine:
    """Renders one animation at a time on a background daemon thread.

    Callers are expected to be serialized (FastAPI handlers on a single event loop);
    the engine only guards against its own render thread via the stop event.
    """

    def __init__(self) -> None:
        self._thread: threading.Thread | None = None
        self._stop = threading.Event()

    def start(self, strip, geometry: StripGeometry, render: AnimationFn, params: dict, fps: float = 24.0) -> None:
        self.stop()
        stop = threading.Event()
        self._stop = stop
        # Render the first frame synchronously so the strip updates before the request returns.
        strip.show_frame(_render_frame(geometry, render, params, 0.0))
        thread = threading.Thread(
            target=self._run,
            args=(stop, strip, geometry, render, params, fps),
            daemon=True,
            name="led-animation",
        )
        self._thread = thread
        thread.start()

    def stop(self) -> None:
        thread = self._thread
        if thread is None:
            return
        self._stop.set()
        thread.join(timeout=1.0)
        self._thread = None

    def is_running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def _run(
        self,
        stop: threading.Event,
        strip,
        geometry: StripGeometry,
        render: AnimationFn,
        params: dict,
        fps: float,
    ) -> None:
        start_time = time.monotonic()
        frame_index = 1
        try:
            # Deadlines are absolute so render time does not accumulate as drift.
            while not stop.wait(max(0.0, start_time + frame_index / fps - time.monotonic())):
                elapsed = time.monotonic() - start_time
                strip.show_frame(_render_frame(geometry, render, params, elapsed))
                frame_index += 1
        except Exception:
            logger.exception("animation loop crashed")


def _render_frame(geometry: StripGeometry, render: AnimationFn, params: dict, t: float) -> np.ndarray:
    full = np.zeros((geometry.num_pixels, 3), dtype=np.uint8)
    full[geometry.led_ids] = render(geometry, t, params)
    return full
