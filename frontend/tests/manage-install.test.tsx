import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { guideSteps } from '~/install/guide'
import { resetProgress } from '~/install/progress'
import ManageInstall from '~/routes/manage.install'
import ManageInstallStep from '~/routes/manage.install.step'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/manage/install" element={<ManageInstall />} />
        <Route path="/manage/install/:step" element={<ManageInstallStep />} />
      </Routes>
    </MemoryRouter>
  )

describe('Installation guide routes', () => {
  beforeEach(() => {
    resetProgress()
    window.localStorage.clear()
  })

  it('lists every step with nothing done on a fresh device', () => {
    renderAt('/manage/install')

    for (const step of guideSteps) {
      expect(screen.getByRole('heading', { name: step.title })).toBeInTheDocument()
    }
    expect(screen.getByText(`0 of ${guideSteps.length} steps done`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start the guide' })).toHaveAttribute(
      'href',
      `/manage/install/${guideSteps[0].slug}`
    )
  })

  it('marks a step done once every checklist item is ticked', async () => {
    const user = userEvent.setup()
    const first = guideSteps[0]
    renderAt(`/manage/install/${first.slug}`)

    for (const item of first.checklist) {
      await user.click(screen.getByRole('checkbox', { name: item.label }))
    }
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(window.localStorage.getItem('kallax.installProgress')).toContain(`${first.slug}:`)

    await user.click(screen.getByRole('link', { name: /All steps/ }))
    expect(screen.getByText(`1 of ${guideSteps.length} steps done`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: `Continue: ${guideSteps[1].title}` })).toBeInTheDocument()
  })

  it('moves between steps with previous and next', async () => {
    const user = userEvent.setup()
    renderAt(`/manage/install/${guideSteps[0].slug}`)

    await user.click(screen.getByRole('link', { name: `Next: ${guideSteps[1].title} →` }))
    expect(screen.getByRole('heading', { level: 2, name: guideSteps[1].title })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: `← ${guideSteps[0].title}` }))
    expect(screen.getByRole('heading', { level: 2, name: guideSteps[0].title })).toBeInTheDocument()
  })

  it('offers the way back to the overview on the last step', () => {
    renderAt(`/manage/install/${guideSteps[guideSteps.length - 1].slug}`)

    expect(screen.getByRole('link', { name: 'Back to overview' })).toHaveAttribute('href', '/manage/install')
  })

  it('shows not found for an unknown step', () => {
    renderAt('/manage/install/no-such-step')

    expect(screen.getByRole('heading', { name: 'Step not found' })).toBeInTheDocument()
  })
})
