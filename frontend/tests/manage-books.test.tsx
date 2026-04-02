import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ManageBooks from '~/routes/manage.books'

const apiMocks = vi.hoisted(() => ({
  createBook: vi.fn(),
  deleteBook: vi.fn(),
  exportBooksCsv: vi.fn(),
  getGrid: vi.fn(),
  importBookArchive: vi.fn(),
  importBooksCsv: vi.fn(),
  linkBookArchive: vi.fn(),
  listBooks: vi.fn(),
  updateBook: vi.fn(),
}))

vi.mock('~/utils/api', () => ({
  createBook: apiMocks.createBook,
  deleteBook: apiMocks.deleteBook,
  exportBooksCsv: apiMocks.exportBooksCsv,
  getGrid: apiMocks.getGrid,
  importBookArchive: apiMocks.importBookArchive,
  importBooksCsv: apiMocks.importBooksCsv,
  linkBookArchive: apiMocks.linkBookArchive,
  listBooks: apiMocks.listBooks,
  updateBook: apiMocks.updateBook,
}))

describe('Manage books route', () => {
  beforeEach(() => {
    apiMocks.listBooks.mockResolvedValue([
      {
        id: 1,
        title: 'The Paper Engine',
        author: 'Aaron Fisher',
        isbn: null,
        user_tags: ['cards'],
        notes: 'Shelf copy',
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
      },
    ])
    apiMocks.getGrid.mockResolvedValue({
      id: 1,
      name: 'Main Shelf',
      width: 2,
      height: 1,
      boxes: [[{ id: 10, x: 1, y: 2, leds: [1, 2] }]],
    })
    apiMocks.linkBookArchive.mockResolvedValue({
      preview: {
        external_id: '140',
        source_url: 'https://www.conjuringarchive.com/list/medium/140',
        title: 'The Paper Engine',
        subtitle: null,
        authors: ['Aaron Fisher'],
      },
      book: {
        id: 1,
        title: 'The Paper Engine',
        author: 'Aaron Fisher',
        isbn: null,
        user_tags: ['cards'],
        notes: 'Shelf copy',
        box: { id: 10, x: 1, y: 2 },
        archive_publication: null,
      },
    })
    apiMocks.importBookArchive.mockResolvedValue({})
  })

  it('shows imported archive metadata and allows archive linking from edit mode', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ManageBooks />
      </MemoryRouter>
    )

    expect((await screen.findAllByText('The Paper Engine')).length).toBeGreaterThan(0)
    expect(screen.getByText(/2 indexed entries linked/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByLabelText('Conjuring Archive URL or medium id'))
    await user.type(screen.getByLabelText('Conjuring Archive URL or medium id'), '140')
    await user.click(screen.getByRole('button', { name: 'Link archive' }))

    await waitFor(() => {
      expect(apiMocks.linkBookArchive).toHaveBeenCalledWith(1, '140')
    })
  })
})
