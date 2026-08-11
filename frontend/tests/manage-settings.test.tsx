import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import ManageSettings from '~/routes/manage.settings'
import { DEFAULT_PAGE_SIZE, usePageSize } from '~/utils/settings'

// A tiny probe so the test can read the store the way a real route would.
const PageSizeProbe = () => <span data-testid="page-size">{usePageSize()}</span>

describe('Manage settings route', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to the default page size and persists a new choice', async () => {
    const user = userEvent.setup()

    render(
      <>
        <ManageSettings />
        <PageSizeProbe />
      </>
    )

    expect(screen.getByTestId('page-size')).toHaveTextContent(String(DEFAULT_PAGE_SIZE))

    await user.selectOptions(screen.getByRole('combobox'), '100')

    // The live store updates and the value is written through to storage.
    expect(screen.getByTestId('page-size')).toHaveTextContent('100')
    expect(window.localStorage.getItem('kallax.pageSize')).toBe('100')
  })

  it('falls back to the default when another tab stores an unoffered value', () => {
    render(<PageSizeProbe />)

    // A `storage` event is how another tab's write reaches this one; an out-of-range value must not
    // leak through as a limit the backend would reject.
    act(() => {
      window.localStorage.setItem('kallax.pageSize', '9999')
      window.dispatchEvent(new StorageEvent('storage', { key: 'kallax.pageSize' }))
    })

    expect(screen.getByTestId('page-size')).toHaveTextContent(String(DEFAULT_PAGE_SIZE))
  })
})
