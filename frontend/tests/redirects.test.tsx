import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import RedirectBooks from '~/routes/redirect.books'
import RedirectLeds from '~/routes/redirect.leds'

describe('Legacy redirects', () => {
  it('redirects /books into the manage books area', async () => {
    render(
      <MemoryRouter initialEntries={['/books']}>
        <Routes>
          <Route path="/books" element={<RedirectBooks />} />
          <Route path="/manage/books" element={<div>Manage Books Destination</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Manage Books Destination')).toBeInTheDocument()
  })

  it('redirects /grid/assign-leds into the manage led setup area', async () => {
    render(
      <MemoryRouter initialEntries={['/grid/assign-leds']}>
        <Routes>
          <Route path="/grid/assign-leds" element={<RedirectLeds />} />
          <Route path="/manage/grid/leds" element={<div>Manage LEDs Destination</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Manage LEDs Destination')).toBeInTheDocument()
  })
})
