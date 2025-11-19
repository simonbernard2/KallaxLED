from __future__ import annotations

import math
import time
from collections.abc import Callable
from typing import Any

import board
import neopixel
import numpy as np
from numpy.typing import NDArray
from app.grid import RGBType, BoxType


RGB = tuple[int, int, int]
Pixels = NDArray[np.int64]


PixelFactory = Callable[..., Any]


class Strip:
    """Facade over a NeoPixel strip with helpers for common bookshelf animations."""

    def __init__(
        self,
        g_pid,
        number_of_leds: int,
        auto_write: bool = False,
        *,
        pixel_factory: PixelFactory | None = None,
    ) -> None:
        factory = pixel_factory or neopixel.NeoPixel
        self.pixels = factory(g_pid, number_of_leds, auto_write=auto_write)

    @classmethod
    def default(
        cls,
        *,
        number_of_leds: int = 150,
        auto_write: bool = False,
        pixel_factory: PixelFactory | None = None,
    ) -> "Strip":
        return cls(
            board.D18,
            number_of_leds,
            auto_write=auto_write,
            pixel_factory=pixel_factory,
        )

    def turn_off(self) -> None:
        self.pixels.fill((0, 0, 0))
        self.pixels.show()

    def leds(self) -> list[BoxType]:
        boxes = []
        for i in range(len(self.pixels)):
            pixel = self.pixels[i]
            rgb = RGBType(red=pixel[0], green=pixel[1], blue=pixel[2])
            box = BoxType(id=i, rgb=rgb)
            boxes.append(box)
        return boxes

    def transition(
        self, led_indexes: list[int], color: RGB, speed_ms: int = 1000
    ) -> None:
        led_fades = [
            self._fade_rgb(self.pixels[i], color, speed_ms)  # type:ignore
            for i in led_indexes
        ]
        while not self._transition_completed(led_indexes, color):
            for i in range(len(led_fades)):
                self._apply_step_to_led(led_indexes[i], led_fades[i], color)
            self.pixels.show()
            time.sleep(speed_ms / (250 * 1000))

    def transition_single_led(
        self, led_index: int, color: RGB, speed_ms: int = 1000
    ) -> None:
        self.transition([led_index], color, speed_ms)

    def bullet(
        self,
        indexes_range: range,
        color: RGB,
        *,
        speed_ms: int = 1000,
        width: int = 2,
        auto_clear=True,
    ) -> None:
        original_state = np.array([self.pixels])
        roll_direction = -width if indexes_range.start > indexes_range.stop else width

        next_state = np.array([self.pixels])
        if roll_direction > 0:
            next_state[
                :, indexes_range.start : indexes_range.start + roll_direction, :
            ] = color
        else:
            next_state[
                :, roll_direction + indexes_range.start : indexes_range.start, :
            ] = color

        states = np.concatenate([np.array([self.pixels]), next_state], axis=0)
        for _ in indexes_range:
            next_state = np.roll(next_state, roll_direction, axis=1)
            states = np.concatenate((states, next_state), axis=0)

        self._apply_states(list(states), speed_ms)
        if auto_clear:
            self._apply_states(list(original_state), speed_ms)

    def swipe(self, indexes_range: range, color: RGB, speed_ms: int = 1) -> None:
        next_state = np.array(self.pixels)
        next_state[0] = color
        states = [np.array(self.pixels), next_state]
        for _ in indexes_range:
            next_state = np.minimum(np.roll(next_state, 3) + next_state, 255)
            states.append(next_state)

        self._apply_states(states, speed_ms)

    def _apply_state(self, state: Pixels) -> None:
        for i in range(len(state)):
            self.pixels[i] = state[i]

    def _apply_states(self, states: list[Pixels], speed_ms: int) -> None:
        for state in states:
            self._apply_state(state)
            self.pixels.show()
            time.sleep(speed_ms / 1000 / len(states))

    def _apply_step_to_led(self, led_index: int, fade: tuple, color: RGB) -> None:
        fade_r, fade_g, fade_b = fade
        end_r, end_g, end_b = color

        current_r, current_g, current_b = self.pixels[led_index]

        step_r, min_max_r = fade_r
        step_g, min_max_g = fade_g
        step_b, min_max_b = fade_b

        current_r = min_max_r(current_r + step_r, end_r)
        current_g = min_max_g(current_g + step_g, end_g)
        current_b = min_max_b(current_b + step_b, end_b)

        self.pixels[led_index] = (current_r, current_g, current_b)

    def _fade_rgb(self, start_color: RGB, end_color: RGB, speed_ms: int) -> tuple:
        return (
            self._fade_color_channel(start_color[0], end_color[0], speed_ms),
            self._fade_color_channel(start_color[1], end_color[1], speed_ms),
            self._fade_color_channel(start_color[2], end_color[2], speed_ms),
        )

    def _fade_color_channel(
        self, start_value: int, end_value: int, speed_ms: int
    ) -> tuple[int, Any]:
        diff = end_value - start_value
        step = diff / speed_ms
        if diff >= 0:
            return (math.ceil(step), min)
        else:
            return (math.floor(step), max)

    def _transition_completed(self, led_indexes: list[int], color: RGB) -> bool:
        target = tuple(color)
        return all(tuple(self.pixels[i]) == target for i in led_indexes)
