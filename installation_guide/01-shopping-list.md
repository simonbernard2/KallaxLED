# 1. Shopping list

What to buy and which tools to borrow. Specs, not brand names: I can't promise a part number stays on sale, so match the spec to the listing.

**Quantities depend on the plan from [step 2](02-plan-your-layout.md).** The numbers below are for the default plan (5 rows of 50 LEDs, two power zones). Read step 2 first if you want to change it, or buy now and adjust.

## What you need

Nothing yet; this is the shopping step.

## Parts

### LED strip

| Item | Spec | Qty | Stage | Notes |
|---|---|---|---|---|
| WS2812B strip, 5 V, 30 LEDs/m, 150 LEDs per 5 m reel | The one you already have (BTF-LIGHTING "ECO") | 1 | Stage 1 | **VERIFY** from the label that it is 5 V and 30 LEDs/m. A 12 V strip would be destroyed by this wiring. |
| Second reel of the same strip | Same model, same LEDs/m | 1 | Stage 2 | Buy it when you start Stage 2. Same model keeps colour and brightness matching. |

### Power

| Item | Spec | Qty | Stage | Notes |
|---|---|---|---|---|
| 5 V power supply, **enclosed, plug-in** | Output 5 V DC, **10 A** or more, barrel plug (5.5 × 2.1 mm is typical, **VERIFY**), certified for your country | 1 | Stage 1 | See the next table for why 10 A. If you can't find an enclosed 10 A plug-in supply, use the "one small supply per row" alternative below. |
| Second 5 V supply | Same spec, 6 A or more is enough for rows 4 and 5 | 1 | Stage 2 | |
| Female DC barrel jack with screw terminals | Matches your supply's plug | 1 per supply | both | Lets you connect wires without cutting the supply's cable. |
| Inline fuse holder + fuses | Blade or glass, wired between the supply and the rest; fuse rating just above the zone's full-white current (see step 2) and **below the rating of the thinnest wire** it protects | 1 per supply | both | Fuse and wire ratings vary: check the manufacturer's numbers. |
| Switched power strip | At least 3 sockets | 1 | both | One switch turns the Pi and all supplies on and off together. |
| Raspberry Pi USB-C supply | Official 5 V 3 A | You have it | | The Pi keeps its own supply. |

**Alternative: one supply per row.** Each row at full white takes 50 × 60 mA = 3 A (**VERIFY** 60 mA per LED). Five enclosed 5 V, 4 A plug-in supplies give you five independent zones with no shared power rails: simpler and safer wiring, but five bricks to hide. Everything in the guide works the same; wherever a step mentions "the rail", read it as "that row's own supply".

### Level shifter, resistor, capacitor

| Item | Spec | Qty | Notes |
|---|---|---|---|
| 74AHCT125 level shifter | Either the bare chip (DIP-14) or a small breakout board with labelled pins | 1 (+1 spare) | A breakout is easier for a beginner. The labels differ between boards: always follow the labels on your board and the diagram in [step 3](03-bench-build.md). Avoid "bidirectional" level shifters built from small transistors (often sold for I²C): they are too slow for this signal (**VERIFY**). |
| Resistor | 470 Ω, ¼ W (anything from 300 to 500 Ω is fine) | 3 (spare) | One goes on the data wire. |
| Electrolytic capacitor | 1000 µF, **at least 10 V** | 3 (1 per supply + spare) | Has a + and a − leg. See [step 3](03-bench-build.md#the-capacitor). |
| Ceramic capacitor | 0.1 µF | 2 | Optional: across the level shifter's power pins, right next to it. |
| Half-size breadboard | | You have it | For the bench test. |
| Dupont jumper wires | Male-to-male and male-to-female | 1 pack | |

### Wire and connectors

| Item | Spec | Qty | Notes |
|---|---|---|---|
| Power wire | Stranded, 16 AWG (1.5 mm²), red and black | about 6 m of each to start | For the supply feed and vertical rails. **Measure before buying in step 2.** Use thicker (smaller AWG number) wire for runs over 1 m. |
| Row tap wire | Stranded, 18 AWG (1 mm²), red and black | about 5 m of each | From the rail to each row. |
| Pad pigtail wire | Flexible stranded, 20 AWG (0.5 mm²), red and black | about 2 m of each | The short flexible wires soldered to the strip's pads for power; thick wire is too stiff for the pads. |
| Data / jumper wire | Flexible stranded, 22 AWG, 3 colours, e.g. red / black / green | about 3 m | Row-to-row jumpers and the data wire. |
| Lever-nut splice connectors | 3-way and 5-way, rated for the current | 8 | Join many wires with no solder. Check the connector's current rating. |
| Solderless strip connectors (optional) | 3-pin for **10 mm wide** WS2812 strip, **VERIFY** your strip's width | 8 | Only if you will not solder. See [step 5](05-cut-and-join.md). |
| Heat-shrink tubing | Assorted, 3 mm to 6 mm | 1 pack | To insulate joints. |

### Mounting and hiding

| Item | Spec | Notes |
|---|---|---|
| Isopropyl alcohol (90 %+) and lint-free cloth | | To clean the edge before sticking. |
| Painter's tape | Low-tack | For the mock-up and for holding things while you work. |
| Removable double-sided mounting tape (foam) | | Under the strip if the strip's own tape isn't enough. |
| Adhesive cable clips | Small, self-adhesive | Hold wires along the back. |
| Cable ties and tidy sleeve | | |
| Self-adhesive hook-and-loop strips | | To hang the control box on the side of the shelf. |
| Small ventilated plastic box | Room for the Pi, breadboard or board, and wiring | For the controller. Don't seal it: the Pi needs air. |
| Spacers (optional) | Small wooden blocks or rubber feet, 3 to 5 cm | To pull the shelf slightly forward from the wall. See [step 2](02-plan-your-layout.md#will-the-glow-look-good). |
| Aluminium channel with opal cover (optional) | Wide enough for a 10 mm strip | Only for the alternative positions B or C in step 2. |

## Tools

| Tool | Why |
|---|---|
| **Multimeter** | Checks voltage, continuity, polarity. You need it. |
| Wire stripper | Removes insulation without cutting copper. |
| Flush cutters / small scissors | Cutting wires and the strip. |
| Tape measure and pencil | Step 2. |
| Small screwdrivers | Screw terminals. |
| Heat gun or lighter | Shrinks heat-shrink tubing. |
| **Soldering iron** (optional but recommended) | Temperature-controlled, around 30 to 60 W. Plus rosin-core solder (about 0.8 mm), flux, a stand, and a damp sponge. |
| Magnifying glass or phone zoom | The strip's pads are small. |
| Safety glasses | Solder and cut wire clippings can fly. |

## How to check it worked

- Every item above has a tick or a reason why you skipped it.
- The label of your power supply says **Output: 5 V** (DC) and at least 10 A (Stage 1).
- You know whether you are soldering or using solderless connectors (see [step 5](05-cut-and-join.md)).

## Common mistakes

- Buying a 12 V or 24 V supply because it was cheaper. Your strip takes 5 V only.
- Buying a supply with bare screw terminals for the mains side. Those need someone qualified to wire them safely. Buy a plug-in one.
- Buying wire that is too thin for the power rail (high-numbered AWG). It heats up and wastes voltage.
- Skipping the multimeter.

Next: [2. Plan your layout](02-plan-your-layout.md)
