import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('manage', 'routes/manage.tsx', [
    index('routes/manage.index.tsx'),
    route('books', 'routes/manage.books.tsx'),
    route('grid', 'routes/manage.grid.tsx'),
    route('grid/leds', 'routes/manage.grid-leds.tsx'),
    route('settings', 'routes/manage.settings.tsx'),
  ]),
  route('books', 'routes/redirect.books.tsx', { id: 'legacy-books' }),
  route('grid', 'routes/redirect.grid.tsx', { id: 'legacy-grid' }),
  route('grid/create', 'routes/redirect.grid.tsx', { id: 'legacy-grid-create' }),
  route('grid/view', 'routes/redirect.grid.tsx', { id: 'legacy-grid-view' }),
  route('grid/edit', 'routes/redirect.grid.tsx', { id: 'legacy-grid-edit' }),
  route('grid/assign-leds', 'routes/redirect.leds.tsx', { id: 'legacy-grid-leds' }),
] satisfies RouteConfig
