import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'

import './app.css'

import NavBar from './utils/components/navbar/navbar'
import Page from './utils/components/page/page'

export const links = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NavBar />
        <Page>{children}</Page>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = 'Something failed'
  let details = 'An unexpected error interrupted the app.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? 'Page not found' : 'Route error'
    details = error.status === 404 ? 'That page no longer exists in the new app structure.' : error.statusText || details
  } else if (error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="page-shell">
      <section className="panel-strong">
        <p className="section-kicker">KallaxLED</p>
        <h1 className="section-heading mt-2">{message}</h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--ink-muted)]">{details}</p>
        {stack && (
          <pre className="mt-5 overflow-x-auto rounded-3xl bg-[var(--forest-strong)]/95 p-4 text-xs text-white">
            <code>{stack}</code>
          </pre>
        )}
      </section>
    </main>
  )
}
