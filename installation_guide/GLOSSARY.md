# Glossary

Every term the guide uses, in plain words. Alphabetical. If a word in a step is in *italics*, it is here.

**Addressable LED / NeoPixel / WS2812B** — An LED strip where every LED has its own tiny chip, so each one can be set to a different colour. "NeoPixel" is Adafruit's brand name for these; WS2812B is the chip family. Your strip is a WS2812B strip. Each LED is called a *pixel*.

**Adhesive backing** — The sticky tape on the back of the strip, usually covered by a paper liner.

**AWG** — American Wire Gauge, a wire thickness scale. A *smaller* number means a *thicker* wire. 16 AWG is thicker than 22 AWG. Thicker wire carries more current without heating up.

**Amp (A), milliamp (mA)** — How much electric current flows. 1 A = 1000 mA. Think of it as how much water flows through a pipe per second.

**Back panel** — The thin board that closes the back of a normal Kallax. Yours has been removed, so the wall is the back of every box.

**BCM number** — The software's numbering of Raspberry Pi pins ("GPIO 18"). It is *not* the same as the *physical pin number* (the position on the header). GPIO 18 is physical pin 12. See [03 Bench build](03-bench-build.md#the-pi-header).

**Breadboard** — A plastic board full of little holes that are wired together in rows inside. You push component legs and jumper wires into the holes to build a circuit without soldering. Good for testing, not for permanent use.

**Brick / power adapter** — A power supply in a closed plastic case with a plug for the wall socket and a cable out. "Enclosed" means you cannot touch the mains inside.

**Capacitor** — A tiny rechargeable bucket that soaks up sudden changes in current. For the strip it smooths the surge when it switches on. The kind used here is an *electrolytic capacitor* and it has a **+ and a − leg**: connect it the right way round. Capacity is measured in microfarads (µF).

**Continuity test** — A multimeter mode that beeps when two points are electrically connected. Use it to check solder joints and wires.

**Current** — See *amp*.

**Data line** — The one wire that carries colour information from the Pi to the strip. On the strip it is labelled **DIN** (data in) at the start and **DO / DOUT** (data out) at the end.

**Dupont jumper wire** — A short wire with a plastic plug on each end, made to push into a breadboard or onto the Pi's pins.

**FPCB** — Flexible printed circuit board. The thin bendy strip your LEDs sit on. Yours is white.

**Fuse** — A deliberate weak link. If too much current flows it burns out and cuts the power before a wire overheats. An *inline fuse* is a fuse built into a wire.

**GPIO** — General-purpose input/output. The pins along the edge of the Raspberry Pi that your programs can switch on and off. Your strip's data comes out of GPIO 18.

**Ground (GND, −)** — The common return path for electricity, and the zero-volt reference that every voltage is measured against. On the strip it is the **GND** pad; on the supply it is the **−** terminal. All grounds in the project must be connected together.

**Heat-shrink tubing** — A plastic sleeve that shrinks when warmed with a heat gun or lighter. Slip it over a soldered joint, then shrink it to insulate the joint.

**IP30** — A rating for dust and water protection. 3 means it keeps out objects bigger than 2.5 mm, 0 means no water protection at all. Your strip is *not* splash-proof.

**Jumper (joint)** — A short piece of wire used to connect the end of one strip piece to the start of the next.

**Level shifter** — A small chip that changes the voltage of a signal. The Pi sends data at 3.3 V; the strip wants about 5 V. A level shifter (here the 74AHCT125) listens to the 3.3 V signal and re-sends it at 5 V.

**Logic level** — The voltage that means "1" in a digital signal. For a Pi it is 3.3 V, for the strip about 5 V.

**Mains** — The electricity from your wall socket (230 V or 120 V). It can kill. Never touch the inside of anything connected to it.

**Multimeter** — A handheld meter that measures volts, amps, resistance and continuity. You need one for this project.

**Ohm (Ω)** — The unit of resistance.

**Pad** — A small metal square on the end of a strip piece where you solder a wire or clip a connector. A strip has three pads at each cutting point: +5 V, data and ground.

**Physical pin number** — The pin's position on the Pi's 40-pin header, counting 1 to 40. See *BCM number*.

**Pixel** — One addressable LED on the strip.

**Power injection** — Feeding power into the strip at more than one place (not only at the start), so the far end of a long strip doesn't get dim or tinted. Each feed is a *tap*.

**Resistor** — A component that limits current. On the data line it protects the first pixel from voltage spikes. Marked in ohms.

**Rail** — A shared wire (or breadboard strip) that carries one voltage to many places. The *5 V rail* and the *ground rail*.

**Service loop** — A little extra loose cable so you can repair or redo a joint later.

**Short circuit** — When + and − touch directly with nothing in between. It can burn wires or destroy a supply. Insulate every exposed joint.

**Solder** — A metal that melts at low temperature and joins two metals when it cools. Applied with a *soldering iron*. **Flux** is a cleaner in the solder that helps it flow.

**Solderless connector** — A clip or plug that joins strip to wire without solder. Easier, less reliable.

**Strip piece** — A length of strip cut from the reel.

**Supply / PSU** — The power supply. Turns the wall socket's mains into 5 V DC.

**Tap** — See *power injection*.

**USB-C supply** — The Raspberry Pi's own power supply, separate from the strip's.

**Volt (V)** — The "pressure" of electricity. Strip: 5 V. Pi data signal: 3.3 V.

**Voltage drop** — The voltage loss along a wire or strip as current flows through it. With a long strip, the far end sees less than 5 V, which makes white look yellow-red and dim.

**Watt (W)** — Power = volts × amps. 5 V × 9 A = 45 W.

**Wire stripper** — A tool that removes insulation from a wire end without cutting the copper.

**74AHCT125** — The model number of the level-shifter chip recommended here (a "quad buffer" with four independent channels; you use one).
