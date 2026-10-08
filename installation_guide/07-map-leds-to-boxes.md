# 7. Map LEDs to boxes

The strips are on the shelf. Now tell the app which LEDs belong to which box, and check every box lights the right place. This uses the app as it is today: nothing is installed or changed.

## What you need

- The shelf powered on, the Pi and the app running
- The app open in a browser on your phone or computer
- A dim room (the mapping page lights each LED very faintly)
- The mapping table below, and a pencil

## 7.1 How the app thinks about it

- Every LED has a **number**. LED **0** is the first LED of row 1 (the one next to the controller), and the numbers go up along the chain: row 1 is 0 to 49, row 2 is 50 to 99, row 3 is 100 to 149 (Stage 1). Rows 4 and 5 would be 150 to 249 (Stage 2).
- Every box has a **list of LED numbers**. When you pick a box, the app lights exactly the LEDs in its list.
- A box can have any number of LEDs (8 to 11 is normal here), and the LEDs over a divider belong to no box.

### Software limits you must respect

> **Stage 1 only (LEDs 0 to 149).** The app's LED-setup page stops at LED **149**, and the code assumes **150 LEDs**. **Don't assign any LED number 150 or higher** until the software has been changed to support more LEDs. Highlighting a box that has one would produce an error in the app.

## 7.2 Which row is which

In this guide **row 1 is the bottom** row of the shelf. The app is different: it names boxes "**Column N, Row M**" counting from the top-left of the grid it draws on screen. So the app's "Row 1" is probably the **top** row of your shelf. **VERIFY** this on your screen with the live check below. The check is the real test, because the light shows you what the app thinks.

| Shelf row (this guide) | Physical position | App "Row" (probably) |
|---|---|---|
| 1 | bottom | 5 |
| 2 | | 4 |
| 3 | | 3 |
| 4 | | 2 |
| 5 | top | 1 |

Columns are numbered from the left in both.

## 7.3 Create the grid (if it isn't there yet)

1. Open the app, go to **Manage → Grid**.
2. Create a grid with **5 columns** and **5 rows** if you haven't already. (The app allows up to 12 × 12.) Give it a name.

## 7.4 Work out the LED ranges

Each row of 5 boxes is covered by one 50-LED strip, but the LEDs don't line up exactly with the boxes. Here is an **example**, assuming each box is 33 cm wide, boxes are 35 cm apart, and the strip starts at the left edge of its first box. **Yours will differ** (the exact boundary LEDs depend on your measurements), so use this only as a starting point and check by eye in 7.5.

| LEDs inside the row (0 to 49) | Box (in the row's travel direction) | Count |
|---|---|---|
| 0 to 9 | 1st | 10 |
| 10 to 19 | 2nd | 10 |
| 20 | over a divider: skip | 0 |
| 21 to 30 | 3rd | 10 |
| 31 to 40 | 4th | 10 |
| 41 | over a divider: skip | 0 |
| 42 to 49 | 5th | 8 |

"Travel direction" means: for rows 1, 3, 5 the 1st box is column 1 (left); for rows 2 and 4, which run right to left, the 1st box is column 5 (right). So for Stage 1:

| Shelf row | Direction | Box 1st → 5th | LEDs |
|---|---|---|---|
| 1 (bottom) | left → right | col 1, 2, 3, 4, 5 | 0–9, 10–19, 21–30, 31–40, 42–49 |
| 2 | right → left | col 5, 4, 3, 2, 1 | 50–59, 60–69, 71–80, 81–90, 92–99 |
| 3 | left → right | col 1, 2, 3, 4, 5 | 100–109, 110–119, 121–130, 131–140, 142–149 |

(Rows 4 and 5, later: 150–199 and 200–249 with the same pattern. Don't map them yet.)

Write your own table once you've done 7.5. It's fine if your numbers differ by one or two.

## 7.5 Map them with the app

Use the app's **LED setup** page. It lights one LED at a time and you tell it which box that LED is in.

1. Open **Manage → Grid → LED setup**.
2. **Turn the room lights off.** The page lights the current LED in a faint red; in daylight you can't see it.
3. The page says "Current LED: #0". Look at the shelf: which LED is lit? It should be the first LED of row 1.
4. **Tap the box on screen** that sits where the lit LED is. The page stores the assignment and **moves on to the next LED automatically**.
5. For an LED that is over a **divider** (no box), tap **Next LED** instead of a box. That skips it.
6. If you tap the wrong box, tap it again to remove the LED, or go back with **Previous LED**.
7. **Save after each row**: press **Save assignments** (the page returns to the grid), then open LED setup again and use **Jump to LED** with the next row's first number (50, then 100), then **Go**. Unsaved work is lost if you leave the page.
8. When the page shows the right total, stop. **For Stage 1 that is 150 LED assignments minus the LEDs you skipped.**

Tip: the page shows "N LEDs assigned" on each box, so you can see the 10, 10, 10, 10, 8 pattern appear.

### Faster option: one request per row

The app also accepts the whole mapping in a single request. This is optional. Use it if tapping 150 times is a drag. It needs a command line on any computer that can reach the Pi.

1. See the box ids: `curl http://<pi-address>:5000/api/grid`. The response lists every box with its `id`, `x` (column, from 0) and `y` (row, from 0).
2. Send the lists for the boxes you want to set. Each list **replaces** that box's old list:

   ```bash
   curl -X PUT http://<pi-address>:5000/api/grid/leds \
     -H 'Content-Type: application/json' \
     -d '{"21": [0,1,2,3,4,5,6,7,8,9], "22": [10,11,12,13,14,15,16,17,18,19]}'
   ```

   The numbers `21` and `22` are examples of box ids. Use the ids from step 1, and check on the shelf afterwards which box really lights. The request isn't range-checked: it will accept a number the strip doesn't have, so keep to 0 to 149.

## 7.6 Verify every box

Now check the result by lighting each box from the app, one by one.

1. Go to the **Find** page (the app's main page) and use its highlight control to light each box in turn (search for a book that lives in that box, or use whatever box picker the page offers). Choose a clear colour (not too bright in a dark room).
2. Look at the shelf. The **strip under that box** should light and nothing else.
3. Tick it off:

| Shelf row | col 1 | col 2 | col 3 | col 4 | col 5 |
|---|---|---|---|---|---|
| 3 (Stage 1, top lit row) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | ☐ | ☐ | ☐ | ☐ | ☐ |
| 1 (bottom) | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 and 5 (Stage 2) | later | | | | |

4. Also try a **solid scene** in white or a colour (everything assigned lights up). This is the quickest way to see any box with no LEDs at all or LEDs that belong to no box.

[Photo: one box lit from the front](images/photos/PLACEHOLDER.md)

## If it's wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Right place, wrong row (the box above or below lights) | The app's row order is the opposite of yours | Remap that row, or use the table in 7.2 |
| A row's boxes light in reverse order | Rows 2 and 4 run right to left; you mapped them left to right | Remap those rows with the right-to-left table |
| Everything in a row is shifted by a box | The first LED of the row isn't where you expected (a jumper joined the wrong way, or a piece got swapped) | Check the data direction and the jumpers (see [step 8](08-troubleshooting-and-safety.md)) |
| Two boxes light at once | An LED is in two lists, or the strip is between boxes | Remove it from one box |
| The wrong box lights only for some LEDs | The boundary LEDs: they're near a divider | Move them to the other box or skip them |
| Nothing lights in a row | The row isn't getting data or power | Step 8 |
| An error in the app | An LED number the strip doesn't have | Remove it (keep to 0 to 149) |

## How to check it worked

- Every box in your lit rows lights its own strip, and only that.
- Nothing else lights when you highlight a box.
- A solid scene lights every strip.
- You have your own LED table written down in case the app's data is ever lost.

## Common mistakes

- Assigning LEDs 150 or higher.
- Trusting the app's "Row 1" to be the bottom of the shelf.
- Not pressing **Save assignments** before leaving the page.
- Mapping rows 2 and 4 in the wrong direction.
- Testing in a bright room: the mapping LED is very dim.

Next: [8. Troubleshooting and safety](08-troubleshooting-and-safety.md)
