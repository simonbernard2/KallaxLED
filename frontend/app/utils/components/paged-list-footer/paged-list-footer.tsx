import Button from '~/utils/components/button/button'

interface SummaryProps {
  isLoading: boolean
  total: number
  loadedCount: number
  /** Shown while the first page is in flight. */
  loadingLabel?: string
  /** Appended once everything is loaded, e.g. "in the catalog". */
  totalSuffix?: string
}

/**
 * The "N books" / "showing N of M" line that goes with `usePagedList`.
 *
 * Both search screens render this same ternary. It sits in the page header on one and above the
 * rows on the other, so it stays separate from the show-more button below.
 */
export const PagedListSummary = ({
  isLoading,
  total,
  loadedCount,
  loadingLabel = 'Searching…',
  totalSuffix,
}: SummaryProps) => {
  if (isLoading) return <>{loadingLabel}</>
  if (total !== loadedCount) {
    return (
      <>
        Showing {loadedCount} of {total} books
      </>
    )
  }
  return (
    <>
      {total} {total === 1 ? 'book' : 'books'}
      {totalSuffix ? ` ${totalSuffix}` : ''}
    </>
  )
}

interface ShowMoreProps {
  hasMore: boolean
  isLoadingMore: boolean
  nextPageCount: number
  showMore: () => void
}

export const PagedListShowMore = ({ hasMore, isLoadingMore, nextPageCount, showMore }: ShowMoreProps) => {
  if (!hasMore) return null

  return (
    <Button tone="ghost" onClick={() => showMore()} disabled={isLoadingMore}>
      {isLoadingMore ? 'Loading…' : `Show ${nextPageCount} more`}
    </Button>
  )
}
