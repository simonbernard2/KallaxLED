import { startTransition, useCallback, useRef, useState } from 'react'
import type { Paged, PageParams } from '~/utils/api'
import { usePageSize } from '~/utils/settings'

interface Options<T> {
  /** Fetches one page. Both list endpoints already share this shape. */
  fetchPage: (query: string, params: PageParams) => Promise<Paged<T>>
  /** Shown when the first page fails. */
  loadErrorMessage: string
  /** Shown when an additional page fails. */
  moreErrorMessage: string
  /** Runs after any successful fetch, with just the items that arrived. */
  onPageLoaded?: (items: T[]) => void
}

export interface PagedList<T> {
  items: T[]
  total: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  setError: (message: string | null) => void
  /** How many more rows the next "show more" would add. */
  nextPageCount: number
  hasMore: boolean
  load: (query?: string) => Promise<void>
  showMore: () => Promise<void>
}

/**
 * One page-at-a-time list backed by a paged endpoint.
 *
 * Both the dashboard and the manage catalog render the same "first page, then append" flow; keeping
 * it here means the page-size setting only has to be wired in once.
 */
export const usePagedList = <T>({
  fetchPage,
  loadErrorMessage,
  moreErrorMessage,
  onPageLoaded,
}: Options<T>): PagedList<T> => {
  const pageSize = usePageSize()
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // "Show more" must page through whatever was last *loaded*, not whatever is currently typed in
  // the search box — those differ whenever a route only searches on submit.
  const loadedQuery = useRef('')

  // Read through refs so `load` and `showMore` stay referentially stable for effect deps.
  const latest = useRef({ fetchPage, onPageLoaded, pageSize })
  latest.current = { fetchPage, onPageLoaded, pageSize }

  const load = useCallback(
    async (query = '') => {
      setIsLoading(true)
      setError(null)
      loadedQuery.current = query

      try {
        const { fetchPage: fetch, onPageLoaded: onLoaded, pageSize: limit } = latest.current
        const page = await fetch(query, { limit, offset: 0 })

        startTransition(() => {
          setItems(page.items)
          setTotal(page.total)
        })
        onLoaded?.(page.items)
      } catch {
        setError(loadErrorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [loadErrorMessage]
  )

  const showMore = useCallback(async () => {
    setIsLoadingMore(true)
    setError(null)

    try {
      const { fetchPage: fetch, onPageLoaded: onLoaded, pageSize: limit } = latest.current
      // Offset off the current length so a page-size change mid-list still picks up where it left off.
      const page = await fetch(loadedQuery.current, { limit, offset: items.length })

      // Append rather than replace so the rows already on screen do not jump.
      setItems(previous => [...previous, ...page.items])
      setTotal(page.total)
      onLoaded?.(page.items)
    } catch {
      setError(moreErrorMessage)
    } finally {
      setIsLoadingMore(false)
    }
  }, [items.length, moreErrorMessage])

  return {
    items,
    total,
    isLoading,
    isLoadingMore,
    error,
    setError,
    nextPageCount: Math.min(pageSize, total - items.length),
    hasMore: items.length < total,
    load,
    showMore,
  }
}
