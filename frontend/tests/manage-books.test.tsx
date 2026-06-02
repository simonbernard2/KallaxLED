import { render, screen, waitFor, within } from '@testing-library/react'
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

const buildBook = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  title: 'The Paper Engine',
  author: 'Aaron Fisher',
  isbn: null,
  user_tags: ['cards'],
  notes: 'Shelf copy',
  box: { id: 10, x: 0, y: 0 },
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
  ...overrides,
})

const buildGrid = () => ({
  id: 1,
  name: 'Main Shelf',
  width: 2,
  height: 1,
  boxes: [
    [
      { id: 10, x: 0, y: 0, leds: [1, 2] },
      { id: 11, x: 1, y: 0, leds: [] },
    ],
  ],
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <ManageBooks />
    </MemoryRouter>
  )

describe('Manage books route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.createBook.mockResolvedValue({})
    apiMocks.deleteBook.mockResolvedValue({})
    apiMocks.getGrid.mockResolvedValue(buildGrid())
    apiMocks.importBookArchive.mockResolvedValue({})
    apiMocks.importBooksCsv.mockResolvedValue({ created: 0, skipped: 0, errors: [] })
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
        box: { id: 10, x: 0, y: 0 },
        archive_publication: null,
      },
    })
    apiMocks.listBooks.mockResolvedValue([buildBook()])
    apiMocks.updateBook.mockResolvedValue({})
  })

  it('renders a visual create picker and submits the chosen shelf box', async () => {
    const user = userEvent.setup()

    renderPage()

    expect((await screen.findAllByText('The Paper Engine')).length).toBeGreaterThan(0)

    const createPicker = screen.getByRole('group', { name: 'Shelf box for new book' })
    const addForm = screen.getByRole('button', { name: 'Add book' }).closest('form')

    expect(addForm).not.toBeNull()
    expect(within(createPicker).getByRole('button', { name: 'Unassigned' })).toHaveAttribute('aria-pressed', 'true')

    await user.type(within(addForm!).getByLabelText('Title'), 'Life Savers')
    await user.type(within(addForm!).getByLabelText('Author'), 'Michael Weber')
    await user.click(within(createPicker).getByRole('button', { name: 'Column 2, Row 1' }))
    await user.click(screen.getByRole('button', { name: 'Add book' }))

    await waitFor(() => {
      expect(apiMocks.createBook).toHaveBeenCalledWith({
        title: 'Life Savers',
        author: 'Michael Weber',
        isbn: null,
        user_tags: [],
        notes: null,
        box_id: 11,
      })
    })
  })

  it('preselects the current box in edit mode and allows reassignment', async () => {
    const user = userEvent.setup()

    renderPage()

    expect((await screen.findAllByText('The Paper Engine')).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const editPicker = screen.getByRole('group', { name: 'Shelf box for The Paper Engine' })
    expect(within(editPicker).getByRole('button', { name: 'Column 1, Row 1' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(within(editPicker).getByRole('button', { name: 'Unassigned' }))
    expect(within(editPicker).getByRole('button', { name: 'Unassigned' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(within(editPicker).getByRole('button', { name: 'Column 2, Row 1' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(apiMocks.updateBook).toHaveBeenCalledWith(1, {
        title: 'The Paper Engine',
        author: 'Aaron Fisher',
        isbn: null,
        user_tags: ['cards'],
        notes: 'Shelf copy',
        box_id: 11,
      })
    })
  })

  it('handles missing-grid states for create flow and orphaned edit assignments', async () => {
    const user = userEvent.setup()

    apiMocks.getGrid.mockResolvedValue(null)
    apiMocks.listBooks.mockResolvedValue([
      buildBook({
        box: { id: 99, x: 3, y: 1 },
      }),
    ])

    renderPage()

    expect((await screen.findAllByText('The Paper Engine')).length).toBeGreaterThan(0)

    const createPicker = screen.getByRole('group', { name: 'Shelf box for new book' })
    const addForm = screen.getByRole('button', { name: 'Add book' }).closest('form')

    expect(addForm).not.toBeNull()
    expect(screen.getByText('Create a grid before assigning books to shelf boxes.')).toBeInTheDocument()

    await user.type(within(addForm!).getByLabelText('Title'), 'Shelf Notes')
    await user.type(within(addForm!).getByLabelText('Author'), 'Test Author')
    await user.click(within(addForm!).getByRole('button', { name: 'Add book' }))

    await waitFor(() => {
      expect(apiMocks.createBook).toHaveBeenCalledWith({
        title: 'Shelf Notes',
        author: 'Test Author',
        isbn: null,
        user_tags: [],
        notes: null,
        box_id: null,
      })
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByText(/Current saved box: Column 4, Row 2\./)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => {
      expect(apiMocks.updateBook).toHaveBeenCalledWith(1, {
        title: 'The Paper Engine',
        author: 'Aaron Fisher',
        isbn: null,
        user_tags: ['cards'],
        notes: 'Shelf copy',
        box_id: 99,
      })
    })

    apiMocks.updateBook.mockClear()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const editPicker = screen.getByRole('group', { name: 'Shelf box for The Paper Engine' })
    await user.click(within(editPicker).getByRole('button', { name: 'Unassigned' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(apiMocks.updateBook).toHaveBeenCalledWith(1, {
        title: 'The Paper Engine',
        author: 'Aaron Fisher',
        isbn: null,
        user_tags: ['cards'],
        notes: 'Shelf copy',
        box_id: null,
      })
    })
  })

  it('shows imported archive metadata and allows archive linking from edit mode', async () => {
    const user = userEvent.setup()

    renderPage()

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
