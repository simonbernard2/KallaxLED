import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { GuideStep } from '~/install/guide'
import {
  completedStepCount,
  nextIncompleteStep,
  resetProgress,
  stepStatus,
  toggleItem,
  useInstallProgress,
} from '~/install/progress'

const step = (slug: string, itemIds: string[]): GuideStep => ({
  slug,
  title: slug,
  summary: '',
  blocks: [],
  checklist: itemIds.map(id => ({ id, label: id })),
})

describe('Install progress store', () => {
  beforeEach(() => {
    // The store caches in module scope, so clearing storage alone would leave the old set behind.
    resetProgress()
    window.localStorage.clear()
  })

  it('toggles items and persists them to storage', () => {
    const { result } = renderHook(() => useInstallProgress())

    act(() => toggleItem('wiring', 'ground'))
    expect(result.current.has('wiring:ground')).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('kallax.installProgress')!)).toEqual({ checked: ['wiring:ground'] })

    act(() => toggleItem('wiring', 'ground'))
    expect(result.current.has('wiring:ground')).toBe(false)
  })

  it('ignores corrupt stored progress', () => {
    const { result } = renderHook(() => useInstallProgress())

    act(() => {
      window.localStorage.setItem('kallax.installProgress', '{not json')
      window.dispatchEvent(new StorageEvent('storage', { key: 'kallax.installProgress' }))
    })
    expect(result.current.size).toBe(0)

    act(() => {
      window.localStorage.setItem('kallax.installProgress', JSON.stringify({ checked: ['a:b', 42] }))
      window.dispatchEvent(new StorageEvent('storage', { key: 'kallax.installProgress' }))
    })
    expect([...result.current]).toEqual(['a:b'])
  })

  it('derives step status from ticked items', () => {
    const steps = [step('one', ['a', 'b']), step('two', ['c'])]

    expect(stepStatus(steps[0], new Set())).toBe('todo')
    expect(stepStatus(steps[0], new Set(['one:a']))).toBe('in-progress')
    expect(stepStatus(steps[0], new Set(['one:a', 'one:b']))).toBe('done')
    // An item id from another step does not count.
    expect(stepStatus(steps[1], new Set(['one:c']))).toBe('todo')

    const checked = new Set(['one:a', 'one:b'])
    expect(completedStepCount(steps, checked)).toBe(1)
    expect(nextIncompleteStep(steps, checked)?.slug).toBe('two')
    expect(nextIncompleteStep(steps, new Set([...checked, 'two:c']))).toBeUndefined()
  })
})
