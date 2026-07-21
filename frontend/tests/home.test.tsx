import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Home from '~/routes/home'

const apiMocks = vi.hoisted(() => ({
  applyScene: vi.fn(),
  clearHighlight: vi.fn(),
  getLightingState: vi.fn(),
  highlightBookBox: vi.fn(),
  listTopics: vi.fn(),
  searchBooks: vi.fn(),
}))

vi.mock('~/utils/api', () => ({
  applyScene: apiMocks.applyScene,
  clearHighlight: apiMocks.clearHighlight,
  getLightingState: apiMocks.getLightingState,
  highlightBookBox: apiMocks.highlightBookBox,
  listTopics: apiMocks.listTopics,
  searchBooks: apiMocks.searchBooks,
  PAGE_SIZE: 50,
}))

const paperEngine = {
  id: 1,
  title: 'The Paper Engine',
  author: 'Aaron Fisher',
  isbn: null,
  user_tags: ['cards'],
  notes: null,
  box: { id: 10, x: 1, y: 2 },
  archive_publication: {
    id: 5,
    external_id: '140',
    source_url: 'https://www.conjuringarchive.com/list/medium/140',
    title: 'The Paper Engine',
    subtitle: null,
    authors: ['Aaron Fisher'],
    imported_at: null,
    entry_count: 2,
    topics_preview: [{ id: 7, name: 'Packet Tricks', path: 'Cards / Packet Tricks' }],
    entries_preview: [],
  },
  match_reasons: [{ type: 'topic', label: 'Packet Tricks', detail: 'Cards / Packet Tricks' }],
}

const page = (items: unknown[], total = items.length) => ({ items, total, limit: 50, offset: 0 })

describe('Home route', () => {
  beforeEach(() => {
    apiMocks.searchBooks.mockReset()
    apiMocks.searchBooks.mockResolvedValue(page([paperEngine]))
    apiMocks.listTopics.mockResolvedValue([{ id: 7, name: 'Packet Tricks', path: 'Cards / Packet Tricks' }])
    apiMocks.getLightingState.mockResolvedValue({ active_scene: null, scene_params: {} })
    apiMocks.highlightBookBox.mockResolvedValue({ highlight_box_id: 10, scene_params: {} })
    apiMocks.clearHighlight.mockResolvedValue({ active_scene: null, scene_params: {} })
    apiMocks.applyScene.mockResolvedValue({ active_scene: 'solid', scene_params: { rgb: [1, 2, 3] } })
  })

  it('renders search results and lets the user highlight a shelf box', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect((await screen.findAllByText('The Paper Engine')).length).toBeGreaterThan(0)
    expect(screen.getByText('Column 2, Row 3')).toBeInTheDocument()
    expect(screen.getByText('1 book')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Light' }))

    await waitFor(() => {
      expect(apiMocks.highlightBookBox).toHaveBeenCalledWith(10, [255, 207, 125])
    })
  })

  it('keeps match detail collapsed until the row is expanded', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    await screen.findByText('1 match')
    expect(screen.queryByText(/Topic: Packet Tricks/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { expanded: false }))

    expect(await screen.findByText(/Topic: Packet Tricks/)).toBeInTheDocument()
  })

  it('appends the next page when showing more', async () => {
    const user = userEvent.setup()
    const second = { ...paperEngine, id: 2, title: 'Card College' }
    apiMocks.searchBooks.mockResolvedValueOnce(page([paperEngine], 2))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    const showMore = await screen.findByRole('button', { name: 'Show 1 more' })
    expect(screen.getByText('Showing 1 of 2 books')).toBeInTheDocument()

    apiMocks.searchBooks.mockResolvedValueOnce({ items: [second], total: 2, limit: 50, offset: 1 })
    await user.click(showMore)

    expect(await screen.findByText('Card College')).toBeInTheDocument()
    // The first page stays on screen rather than being replaced.
    expect(screen.getAllByText('The Paper Engine').length).toBeGreaterThan(0)
    expect(apiMocks.searchBooks).toHaveBeenLastCalledWith('', { offset: 1 })
  })
})
