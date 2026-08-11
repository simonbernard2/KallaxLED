import { useSyncExternalStore } from 'react'

/**
 * How many books a page of results holds.
 *
 * Stored per device rather than on the server: a phone and a desktop want different amounts of
 * shelf on screen, and the value is cheap to re-pick if it is ever lost.
 *
 * Every option stays under the backend's MAX_PAGE_LIMIT (200 in app/books/router.py), so no
 * choice offered here can be rejected as an invalid `limit`.
 */
export const PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100]
export const DEFAULT_PAGE_SIZE = 50

const STORAGE_KEY = 'kallax.pageSize'

const listeners = new Set<() => void>()

// useSyncExternalStore calls getSnapshot on every render and compares by identity, so the value is
// cached here and only re-read when something invalidates it.
let cached: number | null = null

const readStoredPageSize = (): number => {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY))
    return PAGE_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_PAGE_SIZE
  } catch {
    // Storage can be unavailable (private browsing, blocked cookies); the default still works.
    return DEFAULT_PAGE_SIZE
  }
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

const getSnapshot = (): number => {
  if (cached === null) cached = readStoredPageSize()
  return cached
}

/** Current page size, re-rendering the caller whenever it changes. */
export const usePageSize = (): number => useSyncExternalStore(subscribe, getSnapshot)

/** Persist a new page size and notify every mounted `usePageSize`. */
export const setPageSize = (value: number): void => {
  const next = PAGE_SIZE_OPTIONS.includes(value) ? value : DEFAULT_PAGE_SIZE
  cached = next
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next))
  } catch {
    // Falling back to in-memory only is better than failing the interaction.
  }
  listeners.forEach(listener => listener())
}
