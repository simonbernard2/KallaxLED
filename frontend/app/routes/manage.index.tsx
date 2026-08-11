import { Link } from 'react-router'

const overviewCards = [
  {
    title: 'Books',
    description: 'Create shelf books, attach box locations, and link Conjuring Archive references for topic-aware search.',
    href: '/manage/books',
  },
  {
    title: 'Grid',
    description: 'Define the bookshelf layout and review which boxes already have LED assignments.',
    href: '/manage/grid',
  },
  {
    title: 'LED Setup',
    description: 'Walk through LED ids one by one and map them to the correct boxes without leaving mobile.',
    href: '/manage/grid/leds',
  },
  {
    title: 'Settings',
    description: 'Tune how this device displays the shelf, including how many results each page holds.',
    href: '/manage/settings',
  },
]

export default function ManageHome() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {overviewCards.map(card => (
        <Link key={card.href} to={card.href} className="panel flex min-h-52 flex-col justify-between hover:bg-[var(--surface-hover)]">
          <div>
            <p className="section-kicker">{card.title}</p>
            <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{card.description}</p>
          </div>
          <span className="mt-6 inline-flex items-center text-sm font-semibold text-[var(--forest-ink)]">Open {card.title}</span>
        </Link>
      ))}
    </section>
  )
}
