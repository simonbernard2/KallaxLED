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

  it('renders only the selected scene’s fields and sends them as API params', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    // "off" declares no fields, so nothing scene-specific is on screen yet.
    await screen.findByLabelText('Scene')
    expect(screen.queryByLabelText('Solid color')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Scene'), 'swipe')

    // Swipe's three fields appear; the other scenes' fields stay out of the DOM.
    expect(screen.getByLabelText('Swipe color')).toBeInTheDocument()
    expect(screen.getByLabelText('Speed (sweeps/s)')).toBeInTheDocument()
    expect(screen.getByLabelText('Direction')).toBeInTheDocument()
    expect(screen.queryByLabelText('Color A')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Direction'), 'left')
    await user.click(screen.getByRole('button', { name: 'Apply scene' }))

    await waitFor(() => {
      // Colors convert to RGB tuples, numbers and selects pass through under the API param names.
      expect(apiMocks.applyScene).toHaveBeenCalledWith('swipe', {
        rgb: [199, 151, 69],
        speed: 0.5,
        direction: 'left',
      })
    })
  })

  it('keeps each scene’s field values separate when switching between them', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    await screen.findByLabelText('Scene')
    await user.selectOptions(screen.getByLabelText('Scene'), 'rainbow')
    await user.clear(screen.getByLabelText('Speed (cycles/s)'))
    await user.type(screen.getByLabelText('Speed (cycles/s)'), '2')

    await user.selectOptions(screen.getByLabelText('Scene'), 'swipe')
    expect(screen.getByLabelText('Speed (sweeps/s)')).toHaveValue(0.5)

    await user.selectOptions(screen.getByLabelText('Scene'), 'rainbow')
    expect(screen.getByLabelText('Speed (cycles/s)')).toHaveValue(2)
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
    expect(apiMocks.searchBooks).toHaveBeenLastCalledWith('', { limit: 50, offset: 1 })
  })
})
