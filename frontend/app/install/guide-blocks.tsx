import type { CalloutTone, GuideBlock } from './guide'

const calloutClasses: Record<CalloutTone, string> = {
  info: 'border-[var(--surface-border)]',
  warning: 'border-[var(--accent-strong)]/60 bg-[var(--accent)]/15',
  danger: 'border-[var(--danger)]/40 bg-[var(--danger)]/10',
}

const calloutLabels: Record<CalloutTone, string> = {
  info: 'Note',
  warning: 'Careful',
  danger: 'Safety',
}

const Block = ({ block }: { block: GuideBlock }) => {
  switch (block.kind) {
    case 'paragraph':
      return <p className="text-sm leading-7 text-[var(--ink)]">{block.text}</p>

    case 'callout':
      return (
        <aside className={`surface-card border-2 p-4 ${calloutClasses[block.tone]}`}>
          <p className="section-kicker">{calloutLabels[block.tone]}</p>
          <p className="mt-1 font-bold text-[var(--ink)]">{block.title}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">{block.text}</p>
        </aside>
      )

    case 'list':
      return (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-[var(--ink)]">
          {block.items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )

    case 'parts':
      return (
        <ul className="surface-card divide-y divide-[var(--surface-border)]">
          {block.items.map(part => (
            <li key={part.name} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-[var(--ink)]">{part.name}</p>
                {part.note && <p className="mt-0.5 text-[var(--ink-muted)]">{part.note}</p>}
              </div>
              <span className="pill shrink-0">{part.qty}</span>
            </li>
          ))}
        </ul>
      )

    case 'image':
      return (
        <figure className="surface-card overflow-hidden">
          <img src={block.src} alt={block.alt} className="w-full" />
          {block.caption && (
            <figcaption className="px-4 py-3 text-xs text-[var(--ink-muted)]">{block.caption}</figcaption>
          )}
        </figure>
      )
  }
}

const GuideBlocks = ({ blocks }: { blocks: GuideBlock[] }) => (
  <div className="flex flex-col gap-4">
    {blocks.map((block, index) => (
      <Block key={index} block={block} />
    ))}
  </div>
)

export default GuideBlocks
