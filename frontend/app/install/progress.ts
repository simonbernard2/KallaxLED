import { useSyncExternalStore } from 'react'

import type { GuideStep } from './guide'

/**
 * Installation guide progress: which checklist items are ticked.
 *
 * Stored per device like the page-size setting (see utils/settings.ts). Ids are `${stepSlug}:${itemId}`
 * so the same item id can appear on two steps. A step is done when all of its items are ticked; there
 * is no separate "done" flag to drift out of sync.
 */

export type StepStatus = 'todo' | 'in-progress' | 'done'

const STORAGE_KEY = 'kallax.installProgress'
const EMPTY: ReadonlySet<string> = new Set()

const listeners = new Set<() => void>()

// useSyncExternalStore compares snapshots by identity, so the parsed set is cached until invalidated.
let cached: ReadonlySet<string> | null = null

export const progressKey = (stepSlug: string, itemId: string) => `${stepSlug}:${itemId}`

const readStoredProgress = (): ReadonlySet<string> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    const checked = (parsed as { checked?: unknown } | null)?.checked
    if (!Array.isArray(checked)) return EMPTY
    return new Set(checked.filter((id): id is string => typeof id === 'string'))
  } catch {
    // Unavailable storage or corrupt JSON: start from scratch rather than break the page.
    return EMPTY
  }
}

const write = (next: ReadonlySet<string>) => {
  cached = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked: [...next] }))
  } catch {
    // Falling back to in-memory only is better than failing the interaction.
  }
  listeners.forEach(listener => listener())
}

const subscribe = (listener: () => void) => {
  // A `storage` event means another tab wrote the key, so the cache is stale.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    cached = null
    listener()
  }

  listeners.add(listener)
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const getSnapshot = (): ReadonlySet<string> => {
  if (cached === null) cached = readStoredProgress()
  return cached
}

const getServerSnapshot = (): ReadonlySet<string> => EMPTY

/** Ticked checklist ids, re-rendering the caller whenever they change. */
export const useInstallProgress = (): ReadonlySet<string> =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

export const toggleItem = (stepSlug: string, itemId: string): void => {
  const key = progressKey(stepSlug, itemId)
  const next = new Set(getSnapshot())
  if (next.has(key)) next.delete(key)
  else next.add(key)
  write(next)
}

export const resetProgress = (): void => write(new Set())

export const stepStatus = (step: GuideStep, checked: ReadonlySet<string>): StepStatus => {
  const ticked = step.checklist.filter(item => checked.has(progressKey(step.slug, item.id))).length
  if (step.checklist.length > 0 && ticked === step.checklist.length) return 'done'
  return ticked > 0 ? 'in-progress' : 'todo'
}

export const completedStepCount = (steps: GuideStep[], checked: ReadonlySet<string>): number =>
  steps.filter(step => stepStatus(step, checked) === 'done').length

/** The step to resume on: the first one not done, or undefined when the whole guide is finished. */
export const nextIncompleteStep = (steps: GuideStep[], checked: ReadonlySet<string>): GuideStep | undefined =>
  steps.find(step => stepStatus(step, checked) !== 'done')
