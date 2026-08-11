#!/usr/bin/env python3
"""Standalone GPIO/NeoPixel smoke test — bypasses the FastAPI app entirely.

Run on the Pi with sudo (GPIO needs root):
    sudo env "PATH=$PATH" uv run python bin/gpio_test.py
"""
import time

try:
    import board
    import neopixel
except ImportError as e:
    raise SystemExit(f"Real hardware driver not importable ({e}). Falling back would use the stub — fix your uv sync --extra pi first.")

NUM_LEDS = 150
PIN = board.D18

print(f"Initializing NeoPixel on {PIN} with {NUM_LEDS} LEDs...")
pixels = neopixel.NeoPixel(PIN, NUM_LEDS, auto_write=False)

print("Filling red...")
pixels.fill((255, 0, 0))
pixels.show()
time.sleep(2)

print("Filling green...")
pixels.fill((0, 255, 0))
pixels.show()
time.sleep(2)

print("Filling blue...")
pixels.fill((0, 0, 255))
pixels.show()
time.sleep(2)

print("Turning off...")
pixels.fill((0, 0, 0))
pixels.show()

print("Done. If you saw no light at all, check: wiring/power to the strip, correct GPIO pin, and that you ran this with sudo.")
