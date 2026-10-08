/**
 * Content for the in-app installation guide.
 *
 * Kept as typed data rather than Markdown so the pages own the layout and the content pass only has
 * to edit this file. Checklist item ids are stored in per-device progress, so keep them stable when
 * rewording a label; changing an id silently un-ticks that item.
 */

export type CalloutTone = 'info' | 'warning' | 'danger'

export type GuideBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'callout'; tone: CalloutTone; title: string; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'parts'; items: { name: string; qty: string; note?: string }[] }
  | { kind: 'image'; src: string; alt: string; caption?: string }

export interface ChecklistItem {
  id: string
  label: string
}

export interface GuideStep {
  /** URL segment under /manage/install. */
  slug: string
  title: string
  /** One line shown on the overview card. */
  summary: string
  duration?: string
  blocks: GuideBlock[]
  checklist: ChecklistItem[]
}

// Placeholder content: the real instructions come in a later pass.
export const guideSteps: GuideStep[] = [
  {
    slug: 'before-you-start',
    title: 'Before you start',
    summary: 'What you are building and the safety rules to keep in mind.',
    duration: '10 min',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This guide walks you from a working strip on the bench to lit boxes on the real shelf.',
      },
      {
        kind: 'callout',
        tone: 'danger',
        title: 'Never touch mains wiring',
        text: 'Only use enclosed power supplies that come with a plug already attached.',
      },
    ],
    checklist: [{ id: 'read-safety', label: 'I have read the safety rules' }],
  },
  {
    slug: 'shopping-list',
    title: 'Shopping list',
    summary: 'The parts and tools to buy before building anything.',
    duration: '30 min',
    blocks: [
      { kind: 'paragraph', text: 'Everything you need, in one list.' },
      {
        kind: 'parts',
        items: [
          { name: '5 V power supply', qty: '1', note: 'Size to be confirmed' },
          { name: 'Wire', qty: 'a few metres' },
        ],
      },
    ],
    checklist: [
      { id: 'parts-ordered', label: 'All parts ordered' },
      { id: 'parts-received', label: 'All parts received' },
    ],
  },
  {
    slug: 'plan-your-layout',
    title: 'Plan your layout',
    summary: 'Measure the shelf and decide where the strip runs.',
    duration: '45 min',
    blocks: [{ kind: 'paragraph', text: 'Measure each box and sketch the path of the strip.' }],
    checklist: [{ id: 'layout-drawn', label: 'Layout sketched' }],
  },
  {
    slug: 'bench-test',
    title: 'Bench test',
    summary: 'Wire everything on the floor and check it lights up.',
    duration: '1 h',
    blocks: [
      { kind: 'paragraph', text: 'Connect the power supply, the Pi and the strip before sticking anything down.' },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Unplug before rewiring',
        text: 'Always unplug the power supply before you move a wire.',
      },
    ],
    checklist: [{ id: 'bench-lit', label: 'The strip lights up from the app' }],
  },
  {
    slug: 'mount-on-the-shelf',
    title: 'Mount on the shelf',
    summary: 'Stick the strip in place and route the wires.',
    duration: '2 h',
    blocks: [{ kind: 'list', items: ['Clean the surface', 'Stick the strip', 'Route the wires'] }],
    checklist: [
      { id: 'strip-mounted', label: 'Strip stuck in place' },
      { id: 'wires-routed', label: 'Wires routed and tidied' },
    ],
  },
  {
    slug: 'map-leds-to-boxes',
    title: 'Map LEDs to boxes',
    summary: 'Tell the app which LEDs belong to which box.',
    duration: '30 min',
    blocks: [{ kind: 'paragraph', text: 'Use LED Setup to assign each LED to its box.' }],
    checklist: [{ id: 'leds-mapped', label: 'Every box has its LEDs assigned' }],
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    summary: 'What to check when something does not light up.',
    blocks: [{ kind: 'paragraph', text: 'Common problems and how to fix them.' }],
    checklist: [{ id: 'all-boxes-light', label: 'Every box lights up correctly' }],
  },
]
