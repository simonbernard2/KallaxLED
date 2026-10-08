# 5. Cut and join

Cut the reels into row pieces, then connect everything that needs connecting: the data jumpers between rows, the power taps, and the controller's data wire. Nothing is stuck to the shelf yet, so mistakes are cheap.

## What you need

- The cut list from [step 2](02-plan-your-layout.md#25-the-cut-list)
- Scissors or flush cutters (sharp, so the cut is clean)
- Wire: 22 AWG for data jumpers, 20 AWG pigtails for power, 18 AWG power runs (see [step 1](01-shopping-list.md))
- Lever-nut connectors, heat-shrink tubing, tape, marker pen
- **Either** a soldering iron (and solder, flux, a stand, a damp sponge) **or** solderless clip connectors
- Multimeter
- The bench build from step 3, for the re-test at the end
- [Photo: the cut line on the strip, with scissors in position](images/photos/PLACEHOLDER.md)

## 5.1 Decide: solder or clip connectors

| | Soldering | Solderless clip connectors |
|---|---|---|
| Reliability | Best. A good joint lasts for years. | Fair. Contacts can loosen or oxidise. |
| Cost to start | Iron and bits | Just the clips |
| Skill | Needs a little practice | Almost none |
| Current | Fine for 3 A power taps | Usually rated for a couple of amps (**VERIFY** the connector's rating): marginal for power taps |

**For beginners: practice soldering on the spare piece first.** For a build with only about 20 joints it is worth it. If you really don't want to solder:

- Use **clip connectors for the data jumpers** (they carry almost no current).
- For the **power taps**, which carry up to about 3 A at full white per row, soldering is much better. Otherwise accept that you must not run all-white scenes for long.

### Soldering in five steps (practice on the spare piece)

1. **Heat the iron** (about 300 to 350 °C is typical for leaded solder; **VERIFY** for your solder; keep contact short because the strip's pads can lift if overheated).
2. **Tin the wire**: strip 3 to 4 mm of insulation, twist the strands, touch solder to the heated wire until it is shiny.
3. **Tin the pad**: touch the iron to the pad for 1 to 2 seconds and feed a little solder until a small shiny dome forms.
4. **Join**: hold the tinned wire on the pad, touch it with the iron for 1 to 2 seconds. Remove the iron and don't move anything for 3 seconds while it sets.
5. **Check**: the joint should be smooth and shiny, not a dull blob. Give the wire a gentle tug. Then check with the multimeter's continuity mode that the pad and wire are connected, and that neighbouring pads are **not** (no bridge of solder).

Work in a ventilated room, don't breathe the smoke, and wear safety glasses. A hot iron burns skin and melts plastic.

## 5.2 Cut the reel

1. **Find the cut lines.** On the strip, between every two LEDs, there is a marked line (often with a small scissors symbol). The line runs through the copper pads: cutting there gives each side half-pads that stay usable.
2. **Cut on the line**, straight across. Never cut anywhere else: the strip won't work beyond the cut.
3. **Reel 1 into three pieces of 50 LEDs.** Count 50 LEDs from the input end of the reel and cut at the cut line after the 50th LED. Repeat once more. You get three pieces: rows 1, 2 and 3.

   ![Cutting reel 1 and reel 2 into pieces of 50](images/row-cut-plan.svg)

4. **Label every piece immediately** with a tape flag at its input end: *Row 1 · LEDs 0–49 · →*. Include the direction. They look identical otherwise.
5. If the floor test found a dead LED, cut so that it ends up at the very end of a piece's tail, or in the spare piece, rather than the middle of a row.

Don't peel the adhesive backing yet.

## 5.3 What gets connected where

Per row piece, working from the controller:

| Where | What goes on the pads | Notes |
|---|---|---|
| **Row 1, input end** | **DIN** ← wire from the **resistor** (controller). **+5V** and **GND** ← power taps. | The controller sits at the bottom left. Keep the resistor right next to this pad. |
| **Row 1, output end** | **DO** → jumper to the **DIN** of row 2. **GND** → jumper's ground. | The jump goes up about one box height. |
| **Row 2, input end** (right) | **DIN** ← jumper from row 1. **GND** ← jumper's ground. | The power tap for row 2 is at its *left* end (its finish). |
| **Row 2, output end** (left) | **DO** → jumper to row 3's DIN, **GND**, and the **power tap**: **+5V** and **GND** | |
| **Row 3** | Same as row 1, but without a controller: DIN from row 2's jumper | |
| **Rows 4 and 5** (Stage 2) | Same pattern | |

![Where the strips run and where the power taps go](images/rear-view-5x5.svg)

*Figure 5.1: The same drawing as in step 2, for reference.*

Remember: **there is no +5 V jumper between rows.** Every row gets its own +5 V from its own tap.

## 5.4 Make the data jumpers

1. Cut a 2-wire jumper (data wire and a ground wire, twisted together) for each row change. Length: about one box pitch plus 10 cm slack (about 45 cm), and measure on your shelf.
2. Join one end to row *n*'s output pads (**DO** and **GND**), and the other end to row *n*+1's input pads (**DIN** and **GND**).
3. Check which pad is which on your strip's printed labels (**VERIFY**): the output end shows **DO** (or DOUT), the input end **DIN**.
4. Cover each joint with heat-shrink, or at least tape, so bare metal can't touch the next pad.

## 5.5 Make the power taps

1. For each row, cut a pair of **20 AWG pigtails**, red and black, about 10 cm.
2. Solder **red to +5V** and **black to GND** at the tap end of the row (the **left** end of every row).
3. At the other end of each pigtail, join to the **18 AWG tap wire** that runs to the power run, using a lever nut or a soldered splice. Leave this lever nut for step 6 if you don't know the final lengths yet.
4. Insulate the pad end with heat-shrink or tape.

The power runs are:

- **Zone 1** (rows 1 to 3): from the 10 A supply, through the fuse, to a lever nut that has the three taps and the capacitor (+ leg) on the red side, and the matching ground nut with the three taps and the capacitor's stripe leg on the black side.
- **Zone 2** (rows 4 and 5, later): its own supply, its own fuse, its own pair of nuts. **Never connect zone 1's +5 V to zone 2's +5 V.** The grounds of both zones are joined together, and joined to the Pi's ground.

## 5.6 Connect the controller

1. Row 1's **DIN** pad gets the **resistor**, then the level shifter's output. Make the wire between resistor and pad as short as you can (a couple of centimetres).
2. Row 1's **GND** gets the common ground (Pi pin 6, level shifter GND, supplies' −).
3. Keep the wire from the controller to the strip as short as you can: short is the safest for the data signal.

## 5.7 Re-test on the floor

Lay the three row pieces on the floor in the zigzag, joined with their jumpers and taps, **exactly as they will be on the shelf**, with the bench build as the controller.

1. Continuity-check: +5V to GND at every row (no beep = good), each row's DIN to the previous row's DO through the jumper (beep = good).
2. Power on. Run the colour test from [step 4](04-floor-test.md).
3. All 150 LEDs red, green, blue, in order; none dark; no flicker.
4. Re-measure the far end of row 3 under red (as in step 4.3). With one tap per row you should be well above the previous measurement.

[Photo: three pieces joined and lit on the floor](images/photos/PLACEHOLDER.md)

## How to check it worked

- Every piece is labelled with its row, its LED range and its direction.
- Each joint is insulated, and a gentle tug doesn't move it.
- The three-row chain lights fully in all three colours and the far end of row 3 is not noticeably dimmer or tinted.
- Nothing is warm.

## Common mistakes

| Mistake | What you see |
|---|---|
| Cut off the line | The piece is dead or has half a pad |
| Piece wired backwards (DO to the previous row's DO) | Dark from there on |
| +5V and GND swapped on a pigtail | Hot, or dead LEDs. **Check with the multimeter before powering.** |
| Joined +5 V of zone 1 to zone 2 | Two supplies fighting; one may shut down. Leave them separate. |
| Solder bridge between two pads | Short circuit: supply shuts down or fuse blows |
| Overheated pad | The pad lifts off the strip: cut back to the next cut line and re-join |
| Jumper not insulated | Intermittent short when the shelf is touched |
| Clip connectors mis-aligned | Flicker, wrong colours at the joint |
| 18 AWG wire soldered straight to a tiny pad | Stiff wire pulls the pad off: use the 20 AWG pigtail |

Next: [6. Mount on the shelf](06-mount-on-the-shelf.md)
