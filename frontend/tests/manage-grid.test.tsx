import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ManageGrid from '~/routes/manage.grid'

const apiMocks = vi.hoisted(() => ({
  createGrid: vi.fn(),
  getGrid: vi.fn(),
  updateGrid: vi.fn(),
}))

vi.mock('~/utils/api', () => ({
  createGrid: apiMocks.createGrid,
  getGrid: apiMocks.getGrid,
  updateGrid: apiMocks.updateGrid,
}))

describe('Manage grid route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.getGrid.mockResolvedValue({
      id: 1,
      name: 'Main Shelf',
      width: 4,
      height: 4,
      boxes: [
        [
          { id: 10, x: 0, y: 0, leds: [] },
          { id: 11, x: 1, y: 0, leds: [] },
          { id: 12, x: 2, y: 0, leds: [] },
          { id: 13, x: 3, y: 0, leds: [] },
        ],
        [
          { id: 14, x: 0, y: 1, leds: [] },
          { id: 15, x: 1, y: 1, leds: [] },
          { id: 16, x: 2, y: 1, leds: [] },
          { id: 17, x: 3, y: 1, leds: [] },
        ],
        [
          { id: 18, x: 0, y: 2, leds: [] },
          { id: 19, x: 1, y: 2, leds: [] },
          { id: 20, x: 2, y: 2, leds: [] },
          { id: 21, x: 3, y: 2, leds: [] },
        ],
        [
          { id: 22, x: 0, y: 3, leds: [] },
          { id: 23, x: 1, y: 3, leds: [] },
          { id: 24, x: 2, y: 3, leds: [] },
          { id: 25, x: 3, y: 3, leds: [] },
        ],
      ],
    })
    apiMocks.updateGrid.mockResolvedValue({
      id: 1,
      name: 'Front Shelf',
      width: 5,
      height: 3,
      boxes: [
        [
          { id: 10, x: 0, y: 0, leds: [] },
          { id: 11, x: 1, y: 0, leds: [] },
          { id: 12, x: 2, y: 0, leds: [] },
          { id: 13, x: 3, y: 0, leds: [] },
          { id: 26, x: 4, y: 0, leds: [] },
        ],
        [
          { id: 14, x: 0, y: 1, leds: [] },
          { id: 15, x: 1, y: 1, leds: [] },
          { id: 16, x: 2, y: 1, leds: [] },
          { id: 17, x: 3, y: 1, leds: [] },
          { id: 27, x: 4, y: 1, leds: [] },
        ],
        [
          { id: 18, x: 0, y: 2, leds: [] },
          { id: 19, x: 1, y: 2, leds: [] },
          { id: 20, x: 2, y: 2, leds: [] },
          { id: 21, x: 3, y: 2, leds: [] },
          { id: 28, x: 4, y: 2, leds: [] },
        ],
      ],
    })
  })

  it('lets the user change grid columns and rows when editing', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ManageGrid />
      </MemoryRouter>
    )

    expect(await screen.findByText('Main Shelf')).toBeInTheDocument()

    const saveForm = screen.getByRole('button', { name: 'Save grid' }).closest('form')
    expect(saveForm).not.toBeNull()

    await user.clear(within(saveForm!).getByLabelText('Grid name'))
    await user.type(within(saveForm!).getByLabelText('Grid name'), 'Front Shelf')
    await user.clear(within(saveForm!).getByLabelText('Columns'))
    await user.type(within(saveForm!).getByLabelText('Columns'), '5')
    await user.clear(within(saveForm!).getByLabelText('Rows'))
    await user.type(within(saveForm!).getByLabelText('Rows'), '3')
    await user.click(within(saveForm!).getByRole('button', { name: 'Save grid' }))

    await waitFor(() => {
      expect(apiMocks.updateGrid).toHaveBeenCalledWith({
        name: 'Front Shelf',
        width: 5,
        height: 3,
      })
    })

    expect(await screen.findByText('Front Shelf')).toBeInTheDocument()
    expect(screen.getByText('5 columns × 3 rows • 0/15 boxes mapped to LEDs')).toBeInTheDocument()
  })
})
