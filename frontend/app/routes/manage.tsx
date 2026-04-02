import { NavLink, Outlet } from 'react-router'

const sections = [
  { path: '/manage/books', label: 'Books' },
  { path: '/manage/grid', label: 'Grid' },
  { path: '/manage/grid/leds', label: 'LED Setup' },
]

export default function ManageLayout() {
  return (
    <div className="flex flex-col gap-6">
      <section className="panel-strong">
        <p className="section-kicker">Manage</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="section-heading">Catalog and hardware setup</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              Keep the reader-facing experience simple. Use this area to curate the shelf library, link Conjuring Archive
              references, manage the grid, and map physical LEDs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.map(section => (
              <NavLink
                key={section.path}
                to={section.path}
                className={({ isActive }) => ['app-nav-link', isActive ? 'app-nav-link-active' : 'bg-white/60'].join(' ')}
              >
                {section.label}
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      <Outlet />
    </div>
  )
}
