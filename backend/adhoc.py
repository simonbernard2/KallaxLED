from app.animations.deps import animation_service
from app.animations import models as m

# 5x1, 2 leds per box
color = (100, 0, 0)
empty = (0, 0, 0)
delay=50
grid_1_led = "cc6f2334-c372-4f32-89f3-fb2209bcff30"
grid_3_leds = "cb161453-5f46-488f-a6c4-75f1b892adef"
# animates blocks of 2 going back and forth
animation_1_led = m.Animation(
    grid_id=grid_1_led,
    name="mazine",
    steps=[
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=0, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=1, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=0, rgb=empty),
                m.BoxEvent(i=0, j=2, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=1, rgb=empty),
                m.BoxEvent(i=0, j=3, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=2, rgb=empty),
                m.BoxEvent(i=0, j=4, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=3, rgb=empty),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=4, rgb=empty),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=4, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=3, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=4, rgb=empty),
                m.BoxEvent(i=0, j=2, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=3, rgb=empty),
                m.BoxEvent(i=0, j=1, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=2, rgb=empty),
                m.BoxEvent(i=0, j=0, rgb=color),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=1, rgb=empty),
            ],
            delay_ms=delay,
        ),
        m.AnimationStep(
            events=[
                m.BoxEvent(i=0, j=0, rgb=empty),
            ],
            delay_ms=0,
        ),
    ]
)

animation_3_leds = animation_1_led.model_copy(update={"grid_id": grid_3_leds})

ass = animation_service()

print("### 1 led per box ###")
ass.animate_adhoc(animation_1_led)

print("### 3 led per box ###")
ass.animate_adhoc(animation_3_leds)
