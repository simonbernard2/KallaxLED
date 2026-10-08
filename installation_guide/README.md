# KallaxLED installation guide

How to physically install the LED strip, power supply and wiring on an IKEA Kallax shelf so that KallaxLED can light up the box a book lives in. No drilling, no electronics knowledge assumed.

> **This guide is about hardware only.** It assumes the Raspberry Pi already runs the KallaxLED app and that you have already seen a strip light up from the app or from `backend/bin/gpio_test.py`. Nothing here changes any software.

## What you are building

```
 mains socket ──► 5 V power supply ──► LED strips (stuck to the back edges of the shelf)
                        │                    ▲
                        │ shared ground      │ data wire (one wire, 5 V signal)
                        ▼                    │
 Raspberry Pi ──► level shifter ──► resistor ┘
   (GPIO 18)       (3.3 V → 5 V)
```

When you pick a book in the app, the Pi sends colour data down the single data wire. Every LED on the strip has a tiny chip that reads its own colour from the stream and passes the rest on. The app keeps a list per shelf box ("box 7 = LEDs 21 to 30"), so it only has to say which numbers to light.

## Your hardware (this guide is written for it)

| Part | What you have | Notes |
|---|---|---|
| LED strip | BTF-LIGHTING WS2812B "ECO", 5050 SMD, 30 pixels per metre, 150 pixels (5 m) per reel, white circuit board, IP30 (not waterproof), 5 V | The product page is gone, so check the strip's own label or datasheet wherever this guide says **VERIFY**. |
| Computer | Raspberry Pi 4 Model B, 4 GB | Data goes out on GPIO 18 (physical pin 12). |
| Shelf | Kallax 5 × 5 (25 boxes), back panel removed | The wall is the back of every box. |
| Power supply | none yet | See [01 Shopping list](01-shopping-list.md) and [02 Plan your layout](02-plan-your-layout.md). |

## The big decision: two stages

A box is about 33 cm wide. At 30 LEDs per metre that is about 10 LEDs per box edge, so lighting one edge of each of the 25 boxes takes about **250 LEDs: two reels**. The app currently supports **150 LEDs** (the count is fixed in the code: see [Software limits](#software-limits)). So the guide builds the shelf in two stages:

| | Stage 1 | Stage 2 |
|---|---|---|
| Rows (bottom = row 1) | Rows 1, 2, 3 | Rows 4, 5 |
| Boxes lit | 15 of 25 | all 25 |
| Strip | Reel 1, cut into 3 pieces of 50 LEDs | Reel 2, cut into 2 pieces of 50 LEDs (one spare piece) |
| LED numbers | 0 – 149 | 150 – 249 |
| Works with today's software? | **Yes** | **No**: needs the LED count raised from 150 to 250 first |
| Power supply | 5 V, 10 A | a second 5 V, 10 A |

You can build Stage 1, use it, and add Stage 2 once the software allows 250 LEDs. The wiring in Stage 1 is done so that Stage 2 just plugs on at the end.

## Read this first: five rules that keep you out of trouble

1. **The strip gets its own 5 V power supply.** Never power it from the Pi's pins. A full strip can pull more than ten times what a Pi pin can give.
2. **Join the grounds.** The power supply's ground (−), the Pi's ground and the strip's ground must all be connected together. Without it, the data signal has no reference and the strip shows random colours or nothing.
3. **Use a level shifter.** The Pi's data signal is 3.3 V, the strip expects 5 V. It often works without one, but not reliably. This guide always includes one.
4. **A resistor on the data wire and a capacitor across the power.** They cost pennies and protect the first LED.
5. **Test everything on the floor before you stick anything down.**

Also: never open or wire mains-powered parts. Use power supplies that are fully enclosed with a plug already attached. See [08 Troubleshooting and safety](08-troubleshooting-and-safety.md) before you power anything on.

## Steps

| # | Step | You will |
|---|---|---|
| 0 | [Glossary](GLOSSARY.md) | Look up any word you don't know. |
| 1 | [Shopping list](01-shopping-list.md) | Buy parts and tools. |
| 2 | [Plan your layout](02-plan-your-layout.md) | Measure the shelf, decide where the strip goes, make a cut list and a power budget. |
| 3 | [Bench build](03-bench-build.md) | Wire Pi, level shifter, resistor, capacitor, power supply and strip on a breadboard and light it. |
| 4 | [Floor test](04-floor-test.md) | Lay the whole strip on the floor and check every LED and the voltage at the far end. |
| 5 | [Cut and join](05-cut-and-join.md) | Cut the strip into rows and connect the pieces. |
| 6 | [Mount on the shelf](06-mount-on-the-shelf.md) | Stick the strips, route the cables, hide the Pi and power supply. |
| 7 | [Map LEDs to boxes](07-map-leds-to-boxes.md) | Tell the app which LEDs belong to which box and check every box. |
| 8 | [Troubleshooting and safety](08-troubleshooting-and-safety.md) | Fix problems. Read the safety notes. |

## Conventions used in this guide

- **Left, right, top, bottom** always mean "as seen from the front of the shelf, standing in front of it". Even for things on the back.
- **Row 1 is the bottom row**, row 5 is the top row. **Column 1 is the left column.**
- **VERIFY** marks a number or fact I could not confirm for your exact strip. Check it against the strip's label or datasheet before relying on it.
- **Photo placeholders** (a line starting with `Photo:`) mark where a picture of your own build would help. See [images/photos/PLACEHOLDER.md](images/photos/PLACEHOLDER.md).
- Every step has the same parts: *What you need*, *Instructions*, *How to check it worked*, *Common mistakes*.
- A word in *italics* the first time it appears is explained in the [glossary](GLOSSARY.md).

## Software limits

Things the app does today that affect the hardware. These are noted here only so the build matches the app; they are not changed by this guide.

| Topic | What the code does | Effect on you |
|---|---|---|
| Number of LEDs | Fixed at 150 (`backend/app/strips/strip.py`, `backend/bin/gpio_test.py`, and the highest LED number in `frontend/app/routes/manage.grid-leds.tsx` is 149) | Stage 1 fits exactly. Stage 2 needs a software change. |
| Data pin | GPIO 18 (`board.D18`), fixed | Wire the data line to physical pin 12 and nowhere else. |
| Brightness | No brightness setting. The brightness is whatever colour you pick, and a white `solid` scene is full power. | The power supply must be sized for full white, or you must avoid full white. See [02 Plan your layout](02-plan-your-layout.md#power-budget). |
| Box to LED mapping | Each box has a free list of LED numbers (any length, any order). You set it in **Manage → Grid → LED setup**. | Boxes may have different numbers of LEDs. See [07 Map LEDs to boxes](07-map-leds-to-boxes.md). |
