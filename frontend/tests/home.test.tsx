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

describe('Home route', () => {
  beforeEach(() => {
    apiMocks.searchBooks.mockResolvedValue([
      {
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
      },
    ])
    apiMocks.listTopics.mockResolvedValue([{ id: 7, name: 'Packet Tricks', path: 'Cards / Packet Tricks' }])
    apiMocks.getLightingState.mockResolvedValue({ active_scene: null, scene_params: {} })
    apiMocks.highlightBookBox.mockResolvedValue({ highlight_box_id: 10, scene_params: {} })
    apiMocks.clearHighlight.mockResolvedValue({ active_scene: null, scene_params: {} })
    apiMocks.applyScene.mockResolvedValue({ active_scene: 'solid', scene_params: { rgb: [1, 2, 3] } })
  })

  it('renders topic-aware search results and lets the user highlight a shelf box', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect((await screen.findAllByText('The Paper Engine')).length).toBeGreaterThan(0)
    expect(screen.getByText(/Topic: Packet Tricks/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Light this shelf' }))

    await waitFor(() => {
      expect(apiMocks.highlightBookBox).toHaveBeenCalledWith(10, [255, 207, 125])
    })
  })
})
