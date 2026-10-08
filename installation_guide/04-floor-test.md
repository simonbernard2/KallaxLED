# 4. Floor test

Before you cut or stick anything, light the **whole reel** lying on the floor. A dead LED or a weak power connection is easy to deal with now and a nightmare once the strip is on the shelf.

## What you need

- The bench build from [step 3](03-bench-build.md), working
- Reel 1, unrolled and **uncut**, lying flat on a bare floor or a sheet of cardboard (not on metal, and not coiled)
- A multimeter
- Safety: nothing conductive under the strip; the pads on the strip's top face must not touch anything metal
- Dim lighting, so you can see dead or faint LEDs

## 4.1 Lay it out

1. Unroll reel 1 in long, gentle zigzags or one long straight line, **adhesive backing still on**.
2. Connect the **input end** (the end where the arrows point away from) to the bench build, exactly as in step 3. Don't connect the output end to anything yet.
3. Check the polarity and continuity checks from step 3.7 again.
4. Power on (both supplies from the same switch).

## 4.2 The colour walk

Run the smoke test from step 3 and watch the whole length:

```bash
sudo env "PATH=$PATH" uv run python bin/gpio_test.py
```

Run it from the `backend` folder on the Pi. It goes red, green, blue, off, for 2 seconds each.

Walk along the strip and check:

- [ ] **Every LED lights** in all three colours. If a stretch goes dark from some point on, the LED just before the dark stretch (or its joint) is the problem: data stops there.
- [ ] **No LED is the wrong colour**, for example blue shown as green.
- [ ] **The first LED** matches the others.
- [ ] **No flicker.**
- [ ] Brightness looks the same along the whole length. (If the far end is dimmer or tinted, you'll measure why below.)

Mark any bad LED with a tiny piece of tape. A strip with one dead LED can still be used if you cut around it at a cut line (see [step 5](05-cut-and-join.md)), and you have a spare piece in Reel 2.

## 4.3 Measure the voltage at the far end

Long strips lose voltage along their length. This measurement tells you whether the far end of a row will look dim or tinted, and whether you'll need power at both ends of each row.

The test script only holds each colour for 2 seconds, which is too short to read a meter comfortably. Use this one instead. It does the same thing as `bin/gpio_test.py` (same libraries, same pin) but holds a colour until you press Enter. Run it from the `backend` folder on the Pi:

```bash
sudo env "PATH=$PATH" uv run python -c 'import board, neopixel; p = neopixel.NeoPixel(board.D18, 150, auto_write=False); p.fill((255, 0, 0)); p.show(); input("Red is on. Press Enter to turn off. "); p.fill((0, 0, 0)); p.show()'
```

*(Written to mirror what `gpio_test.py` does; it hasn't been run by the author of this guide, so if it complains, use `gpio_test.py` again and read the meter during the red step.)*

All red at full power is **150 LEDs × about 20 mA = about 3 A**, which your supply handles easily.

1. Set the multimeter to DC volts (20 V range).
2. With the red fill **on**, touch the probes to the **+5V and GND pads at the input end**. Write the reading down: **V_in**.
3. Touch the probes to the **+5V and GND pads at the far end** (the last LED). Write it down: **V_far**.
4. Press Enter to turn off.

Take care that the probe tips touch only their own pad: a probe bridging +5V and GND is a short circuit. Hold one probe in each hand and rest them on the pads.

**The drop** is D = V_in − V_far.

### What D tells you

For one 50-LED row fed at its start, the drop at **full white** is roughly **one third of D**. Reason: a row at full white takes 3 A (50 × 60 mA), the same current as the whole reel at red, but its copper track is only a third as long, so it loses about a third as much voltage. **This is a rough estimate**: it assumes the strip's resistance is even along its length.

| D (red, whole reel) | Row at full white, fed at the start | What to do |
|---|---|---|
| under about 1 V | under about 0.3 V | One tap at the start of every row is plenty. |
| 1 V to 1.5 V | up to about 0.5 V | Fine for normal use. Add a second tap at the end of each row if you plan to show full white often. |
| over about 1.5 V | more than 0.5 V | **Plan taps at both ends of every row.** Feeding both ends cuts the drop to roughly a quarter. |

(**VERIFY** the 4.5 V floor against the strip's datasheet. WS2812B strips are normally specified for about 3.5 V to 5.3 V, but colours shift well before that.)

If you're curious, repeat the measurement with the second feed connected: run two wires from the supply to the far-end pads (+5V and GND), re-run the red hold, and read V_far again. It should be much closer to V_in.

## 4.4 Heat check

After about 30 seconds of red:

- The strip and its connections are not hot. Slightly warm is fine.
- The power supply is not very hot.
- The fuse holder and the DC jack screws are not hot.

If anything is hot, turn off at the wall and find out why before going further. Usually it is a thin wire or a loose screw.

## 4.5 If you also have reel 2

Repeat 4.1 to 4.4 with reel 2 connected as the first (and only) strip. If you haven't bought it yet, do this when it arrives, before you start Stage 2.

## How to check it worked

- Every LED lights red, green and blue, and is consistent from start to end.
- You have V_in and V_far written down, and know whether you need one tap or two per row.
- Nothing got hot.
- You know which LEDs (if any) are dead.

## Common mistakes

- Testing a **coiled** reel at full power. Coils heat up. Unroll it.
- Powering the Pi but not the strip supply (or vice versa). Use the same switch.
- Probes slipping between pads: short circuit. Go slowly.
- Comparing a quick glance between colours instead of walking the strip.
- Thinking a dead stretch means the strip is broken: usually the problem is **one LED** at the start of the dark stretch.

Next: [5. Cut and join](05-cut-and-join.md)
