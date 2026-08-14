import { NavLink } from 'react-router'

const primaryNavItems = [
  { path: '/', label: 'Find', end: true },
  { path: '/manage', label: 'Manage', end: false },
]

const navLinkClassName = (isActive: boolean) => ['app-nav-link', isActive ? 'app-nav-link-active' : ''].join(' ').trim()

const NavBar = () => {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--surface-border)] bg-[var(--chrome-bg)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="section-kicker">Reader-first shelf search</p>
            <NavLink to="/" className="mt-1 block text-xl font-extrabold tracking-tight text-[var(--ink)]">
              KallaxLED
            </NavLink>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {primaryNavItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => navLinkClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--chrome-bg-strong)] p-2 shadow-[0_24px_50px_-28px_rgba(39,29,23,0.65)] backdrop-blur-md md:hidden">
        <div className="grid w-full max-w-sm grid-cols-2 gap-2">
          {primaryNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => navLinkClassName(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

export default NavBar
