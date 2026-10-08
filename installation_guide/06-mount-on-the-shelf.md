# 6. Mount on the shelf

Stick the strips to the shelf, run the cables, and hide the controller and power supplies. You do this in a careful order: test the glow with tape first, then stick, then test every row as you go.

## What you need

- The joined, tested row pieces from [step 5](05-cut-and-join.md)
- Isopropyl alcohol (90 %+) and a lint-free cloth
- Painter's tape, removable double-sided mounting tape, adhesive cable clips, cable ties
- Self-adhesive hook-and-loop strips and the ventilated plastic box for the controller
- Spacers (3 to 5 cm) if you want a wall gap (see [step 2](02-plan-your-layout.md#24-will-the-glow-look-good))
- Tape measure, pencil, a straight edge (a ruler or a spirit level)
- The bench controller from step 3, powered by the same switched power strip as the supplies
- [Photo: your mock-up taped to one box](images/photos/PLACEHOLDER.md)

Don't have the shelf loaded with books while you work. Take the books out of the boxes you are working on.

## 6.1 Prepare the shelf

1. **Place the shelf** where it will live. If you want a wall gap, put the spacers behind it now (rubber feet or small blocks at the bottom, and where the top rests). Check the shelf is still stable, doesn't wobble, and **consider anchoring it** (see [step 2.9](02-plan-your-layout.md#29-safety-before-you-go-on)).
2. **Check the rear edges**: bare board, plastic edge or paper foil? Is the flat face at least as wide as your strip (about 10 mm; measure T in step 2)?
3. **Clean** every rear edge you'll stick to: wipe with isopropyl alcohol on a lint-free cloth, then let it dry for a minute. Dust and grease are the main reason adhesive fails.
4. **Warm room**: strip adhesive grips better at room temperature (**VERIFY** the adhesive's range).

## 6.2 Test the adhesive on a hidden spot

You don't want to find out in a month that the strip peels, or that taking it off pulls the shelf's paper surface away.

1. Cut about 5 cm from the **spare piece** (or use the end of a piece that is not needed).
2. Clean a spot that won't be seen (the back of a lower board, for example).
3. Peel the backing and press the piece on for 30 seconds.
4. **Wait 24 hours.** Then try to pull it off with a gentle sideways tug: it should hold.
5. Peel it off slowly. Look for **residue** and whether the **surface lifts**.

Choose from this ranking (best for shelf safety and beginners first):

| # | Method | Good | Bad |
|---|---|---|---|
| 1 | **The strip's own tape**, pressed hard for 30 s | Easiest, flat, thin | "ECO" strip tape quality is unknown; may peel the foil on removal; can slip in warm rooms |
| 2 | **Removable double-sided mounting tape** under the strip | Easy to remove | Slightly thicker; check it still sticks to your surface |
| 3 | **Adhesive cable clips** every 20 to 30 cm over the strip | Strong; holds even if the tape fails | Fiddly; clips add height |
| 4 | **Aluminium channel** stuck to the shelf | Best look and heat control | Costs more, deeper; for positions B and C |

Avoid hot glue (it can melt the strip and mark the shelf) and anything that needs drilling.

If the test shows the strip's tape holds well and comes off clean, use method 1 and back it with a few clips (method 3) wherever a joint hangs.

## 6.3 Mock-up: decide where the strip goes

A 30-minute test before committing. Do it in the evening, with the room lights off, and books in the boxes.

1. Take **one row piece** (still with its backing on) and fix it with **painter's tape** to the rear edge of the board under a row of boxes (**position A**, LEDs facing the wall), as in [Figure 2.2](02-plan-your-layout.md#24-will-the-glow-look-good).
2. Connect it to the bench controller. Light it using a **hold-the-colour** command from the Pi. This is like the one in step 4, but dimmer, so it doesn't dazzle you (30 % of full is plenty in a dark room):

   ```bash
   sudo env "PATH=$PATH" uv run python -c 'import board, neopixel; p = neopixel.NeoPixel(board.D18, 150, brightness=0.3, auto_write=False); p.fill((255, 255, 255)); p.show(); input("White at 30 percent. Press Enter to turn off. "); p.fill((0, 0, 0)); p.show()'
   ```

   *(Written to mirror `bin/gpio_test.py`; not run by the author of this guide. This one writes the hardware directly, so it's not the same brightness as the app, which applies its own colour correction.)*

3. Look from the front, standing and sitting, and from a few metres away. Ask:
   - Can I see the **LEDs themselves**? (They should be hidden.)
   - Is the glow **a soft wash** or **bright dots**? If dots, move the shelf away from the wall: try 3 cm, then 5 cm.
   - Is the glow **visible with the books in**? Is it enough to find the right box at a glance?
   - Any **glare** on a glossy wall, or light shining through gaps between books into your eyes?
4. If it is too faint or too dotty, try the alternatives, using the same tape:
   - **B**: stick the strip under the board *above* the box, near the back, facing down.
   - **C**: stick it at the front of the board above, in a diffuser channel, if you have one.
5. Pick one and write it down. **Use the same position for every row.**

If A works but is faint, a bigger wall gap and a lighter wall are the two levers that matter most.

## 6.4 Stick the strips: row by row

Work from the bottom row up. Test after every row, because a mistake in row 1 changes everything above it.

1. **Dry-fit**: lay the piece along its board edge (don't peel yet). The strip's **input end** goes where the plan says: row 1 starts at the **left**, row 2 at the **right**, row 3 at the **left**, and so on. Check the arrow on the strip points along the chain direction, not the other way.
2. Mark the start with a pencil. Lay a straight edge or a spirit level along the board to keep the strip straight.
3. **Peel 10 cm of backing** from the input end. Place the strip with the LEDs facing the wall (position A) and press. Peel and press the next 10 cm. Don't stretch the strip, and don't bend it sharply.
4. **Press the whole length firmly for 30 seconds**. Add a few adhesive clips or small strips of painter's tape over it for the first day.
5. **Hang the jumper and tap wires loose** for now. You'll tidy them in the next section.
6. **Test the row** (and everything before it): run the colour test from step 4 with the controller connected to row 1's input. Rows already stuck down should light in all colours; the new row too.
7. Repeat for the next row. Rows 2, 4 run right to left, rows 1, 3, 5 left to right.

Which board is which: the strip for **row 1** goes on the rear edge of the **bottom board**; the strip for **row 2** on the rear edge of the **board between rows 1 and 2**; and so on up to row 5. Nothing goes on the very top board. (This is the "the strip lights the box above it" rule from step 2.)

[Photo: a mounted strip seen from behind](images/photos/PLACEHOLDER.md)

## 6.5 Route the cables

Keep it simple: wires run up the **outside rear edge** of the shelf, behind the side panels, where nobody looks.

- **Data jumpers** (rows 1→2, 2→3, …) run vertically at the side where the rows change. Row 1→2 and 3→4 are on the **right**; 2→3 and 4→5 on the **left**.
- **Power runs** (one pair per zone) run up the **left** side.
- **Every 20 to 30 cm** hold the wires with a small adhesive clip. Keep the data jumper and its ground twisted together.
- **No sharp bends** at joints. Leave a **service loop** (a few cm of slack) at every joint so you can redo it.
- **Don't run wires across the front** of the shelf or where they can be caught by a vacuum cleaner or a chair.
- **Nothing hangs loose** at the floor: tie the bundle.
- Wires that touch the wall are fine if insulated; don't pinch them between the shelf and the wall.

Join each row's tap pigtails to the zone's lever nuts now (see [step 5.5](05-cut-and-join.md#55-make-the-power-taps)), and connect the capacitor's legs to the matching nuts.

## 6.6 The controller and the power supplies

### The controller

The controller is the Pi, the level shifter, the resistor and the capacitor. The same circuit as the bench build, now somewhere permanent.

1. **Make the circuit permanent.** A breadboard is fine for testing but wires can wobble loose. Better: solder the level shifter, the resistor and the connections onto a small **prototype board** (the same connections as the table in [step 3.6](03-bench-build.md#36-build-it)), or at least **use a breakout with screw terminals** and push the jumper wires firmly. If you keep the breadboard, tape the wires down and don't move it afterwards.
2. **Keep the data path short**: the level shifter and resistor within about 30 cm of row 1's input pad, and the Pi next to them. (**VERIFY** by testing: a short data wire is the safest.)
3. **Put it all in the ventilated plastic box.** Don't seal the box: the Pi must get air. Leave holes or gaps.
4. **Mount the box** with hook-and-loop strips on the **outside left** of the shelf, near the floor (the default), or put it on the floor behind the left side or a plant. It is not a good idea to hide it behind books, or in a closed box.

### The power supplies

1. **Supply 1** (zone 1) goes **on the floor, at the left rear**, not in the boxes; supply 2 next to it when you do Stage 2.
2. Never wrap or cover a supply. They get warm.
3. The **fuse** sits on the +5V wire from each supply, before anything else.
4. All supplies and the Pi's supply plug into **one switched power strip**, so one switch turns the shelf on and off.
5. Keep mains cables away from the low-voltage wiring; don't tie them into the same bundle.

## 6.7 Final check

1. **Power on** (one switch). The Pi boots, the app starts.
2. **Colour test** (step 4): every LED lights in each colour. Check each row, left to right.
3. **Run it for ten minutes** on a mix of colours and feel: supplies, fuse holders, lever nuts and joints. Warm is fine, hot is not.
4. Do a **tug test** on the jumpers and taps, gently.

## How to check it worked

- Every row you've mounted lights completely, in all colours, from the shelf.
- Each strip is straight, stuck down, with the LEDs facing the wall (or in the position you chose).
- No bare copper anywhere; no loose wires hanging.
- The supplies and the Pi are not hot after ten minutes.
- One switch turns everything on and off.

## Common mistakes

| Mistake | Effect |
|---|---|
| Stuck a strip before testing the glow | Peeling it off later damages it |
| Strip stuck the wrong way round | Dark from that row on |
| Strip stretched or kinked | Broken traces: dead stretches |
| Adhesive on a dusty or greasy surface | Strip drops off in days |
| Shelf pushed back against the wall | Bright dots on the wall |
| Controller sealed in a closed box | Pi overheats and throttles |
| Wires pinched between shelf and wall | Insulation damage, short circuits |
| Supplies covered by a cloth or books | Overheating |
| Mixed up which jumper joins which rows | Wrong order of LEDs (see step 7 to fix in the app) |

Next: [7. Map LEDs to boxes](07-map-leds-to-boxes.md)
