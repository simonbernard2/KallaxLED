import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { formatBoxLabel } from '~/grids/box-label'
import Button from '~/utils/components/button/button'
import BookRow from '~/utils/components/book-row/book-row'
import Input from '~/utils/components/input/input'
import {
  applyScene,
  clearHighlight as clearHighlightRequest,
  getLightingState,
  highlightBookBox,
  listTopics,
  searchBooks,
  type BookSearchResult,
  type LightingState,
  type MatchReason,
  type SceneName,
  type Topic,
} from '~/utils/api'
import { usePagedList } from '~/utils/use-paged-list'
import { hexToRgbTuple, useDebouncedCallback } from '~/utils/utils'

const reasonLabels: Record<MatchReason['type'], string> = {
  title: 'Title',
  author: 'Author',
  isbn: 'ISBN',
  tag: 'Tag',
  note: 'Notes',
  publication: 'Publication',
  publication_author: 'Publication author',
  entry: 'Entry',
  entry_creator: 'Entry creator',
  topic: 'Topic',
}

const sceneOptions: Array<{ value: SceneName; label: string }> = [
  { value: 'off', label: 'Off' },
  { value: 'solid', label: 'Solid' },
  { value: 'checkerboard', label: 'Checkerboard' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'swipe', label: 'Color swipe' },
]

const formatReason = (reason: MatchReason) => {
  if (!reason.detail) return `${reasonLabels[reason.type]}: ${reason.label}`
  return `${reasonLabels[reason.type]}: ${reason.label} • ${reason.detail}`
}

const formatLightingSummary = (lightingState: LightingState | null, results: BookSearchResult[]) => {
  if (!lightingState) return 'Ready to search and light a shelf.'
  if (lightingState.highlight_box_id) {
    // A box id means nothing to a reader — name the shelf spot, and the book if it is on screen.
    const lit = results.find(book => book.box?.id === lightingState.highlight_box_id)
    const where = lit?.box ? formatBoxLabel(lit.box) : `box #${lightingState.highlight_box_id}`
    return lit ? `Lighting ${where} — ${lit.title}.` : `Lighting ${where}.`
  }
  if (lightingState.active_scene === 'solid') return 'Solid scene is active across the shelf.'
  if (lightingState.active_scene) return `${lightingState.active_scene} scene is active.`
  return 'No scene or highlight is currently active.'
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [highlightColor, setHighlightColor] = useState('#ffcf7d')
  const [sceneName, setSceneName] = useState<SceneName>('off')
  const [sceneColor, setSceneColor] = useState('#c79745')
  const [checkerColorA, setCheckerColorA] = useState('#c79745')
  const [checkerColorB, setCheckerColorB] = useState('#1d3557')
  const [rainbowSpeed, setRainbowSpeed] = useState(0.1)
  const [rainbowScale, setRainbowScale] = useState(1)
  const [swipeColor, setSwipeColor] = useState('#c79745')
  const [swipeSpeed, setSwipeSpeed] = useState(0.5)
  const [swipeDirection, setSwipeDirection] = useState<'right' | 'left'>('right')
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicFilter, setTopicFilter] = useState('')
  const [lightingState, setLightingState] = useState<LightingState | null>(null)
  const [busyBookId, setBusyBookId] = useState<number | null>(null)
  const [sceneBusy, setSceneBusy] = useState(false)
  const isFirstRender = useRef(true)

  const books = usePagedList<BookSearchResult>({
    fetchPage: searchBooks,
    loadErrorMessage: 'The dashboard could not load. Check the API connection and try again.',
    moreErrorMessage: 'More results could not be loaded.',
  })
  const { setError } = books

  const filteredTopics = useMemo(() => {
    if (!topicFilter) return topics
    const lower = topicFilter.toLowerCase()
    return topics.filter(t => t.name.toLowerCase().includes(lower) || t.path.toLowerCase().includes(lower))
  }, [topics, topicFilter])

  const loadDashboard = useCallback(
    async (nextQuery = '') => {
      setExpandedBookId(null)
      // Both halves of the dashboard load at once; a lighting failure reuses the list's error slot
      // so the page still has exactly one place to report trouble.
      await Promise.all([
        books.load(nextQuery),
        getLightingState()
          .then(setLightingState)
          .catch(() => setError('The dashboard could not load. Check the API connection and try again.')),
      ])
    },
    [books.load, setError]
  )

  useEffect(() => {
    void loadDashboard('')
  }, [])

  useEffect(() => {
    listTopics('').then(setTopics).catch(() => {})
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => { void loadDashboard(query) }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // The debounced effect above is the only thing that loads results, so setting the query is enough.
  // Loading here too would fire a second request and reset paging twice.
  const handleTopicSearch = (topicPath: string) => setQuery(topicPath)

  const handleHighlight = async (book: BookSearchResult) => {
    if (!book.box) return

    setBusyBookId(book.id)
    setError(null)
    try {
      const state = await highlightBookBox(book.box.id, hexToRgbTuple(highlightColor))
      setLightingState(state)
    } catch {
      setError('That shelf box could not be highlighted.')
    } finally {
      setBusyBookId(null)
    }
  }

  const handleClearHighlight = async () => {
    setSceneBusy(true)
    setError(null)
    try {
      const state = await clearHighlightRequest()
      setLightingState(state)
    } catch {
      setError('The current highlight could not be cleared.')
    } finally {
      setSceneBusy(false)
    }
  }

  const buildSceneParams = (): Record<string, unknown> => {
    switch (sceneName) {
      case 'solid':
        return { rgb: hexToRgbTuple(sceneColor) }
      case 'checkerboard':
        return { color_a: hexToRgbTuple(checkerColorA), color_b: hexToRgbTuple(checkerColorB) }
      case 'rainbow':
        return { speed: rainbowSpeed, scale: rainbowScale }
      case 'swipe':
        return { rgb: hexToRgbTuple(swipeColor), speed: swipeSpeed, direction: swipeDirection }
      default:
        return {}
    }
  }

  const handleApplyScene = async () => {
    setSceneBusy(true)
    setError(null)
    try {
      const state = await applyScene(sceneName, buildSceneParams())
      setLightingState(state)
    } catch {
      setError('The scene could not be updated.')
    } finally {
      setSceneBusy(false)
    }
  }

  // Screen swatches never match emitted light, so the shelf itself is the preview: while a picker is
  // being dragged, re-push the color to whatever is already lit. Both previews are no-ops when
  // nothing is on, so dragging a picker can never switch the lights on by itself.
  const previewHighlight = useDebouncedCallback((hex: string) => {
    const boxId = lightingState?.highlight_box_id
    if (boxId == null) return
    highlightBookBox(boxId, hexToRgbTuple(hex)).then(setLightingState).catch(() => {})
  })

  const previewScene = useDebouncedCallback(() => {
    if (lightingState?.active_scene !== sceneName) return
    applyScene(sceneName, buildSceneParams()).then(setLightingState).catch(() => {})
  })

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),20rem]">
      <div className="flex flex-col gap-6">
        <section className="panel-strong">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker">Find</p>
              <h1 className="section-heading mt-2">Search the shelf by book, move, or topic</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
                Search local books, imported archive entry titles, and topic paths like packet tricks or false shuffles,
                then light the matching shelf box in one tap.
              </p>
            </div>

            <div className="rounded-3xl bg-[var(--forest-strong)] px-4 py-3 text-sm text-white shadow-[0_24px_50px_-28px_rgba(31,74,54,0.85)]">
              {formatLightingSummary(lightingState, books.items)}
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={event => event.preventDefault()}>
            <Input
              name="book-search"
              label="Search"
              type="search"
              placeholder="The Paper Engine, packet tricks, false shuffle..."
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <div className="flex items-end sm:min-w-32">
              <Button tone="ghost" className="w-full" onClick={() => setQuery('')}>
                Reset
              </Button>
            </div>
          </form>

          <details className="panel mt-4 md:hidden">
            <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">Quick topic filters</summary>
            <Input
              name="topic-filter-mobile"
              label="Filter topics"
              type="search"
              placeholder="e.g. cards"
              value={topicFilter}
              onChange={event => setTopicFilter(event.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {filteredTopics.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  className="pill hover:border-[var(--accent-strong)] hover:text-[var(--ink)]"
                  onClick={() => void handleTopicSearch(topic.path)}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </details>
        </section>

        <section className="panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Results</p>
              <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">Books on this shelf</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {books.isLoading
                  ? 'Searching…'
                  : books.total === books.items.length
                    ? `${books.total} ${books.total === 1 ? 'book' : 'books'}`
                    : `Showing ${books.items.length} of ${books.total} books`}
              </p>
            </div>
            <Link to="/manage/books" className="text-sm font-semibold text-[var(--forest-ink)]">
              Manage catalog
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {books.items.map(book => (
              <BookRow
                key={book.id}
                book={book}
                expanded={expandedBookId === book.id}
                onToggle={() => setExpandedBookId(current => (current === book.id ? null : book.id))}
                badge={
                  book.match_reasons.length > 0 ? (
                    <span className="pill bg-[var(--accent)]/20 text-[var(--ink)]">
                      {book.match_reasons.length} {book.match_reasons.length === 1 ? 'match' : 'matches'}
                    </span>
                  ) : null
                }
                actions={
                  <Button onClick={() => void handleHighlight(book)} disabled={!book.box || busyBookId === book.id}>
                    {busyBookId === book.id ? 'Lighting…' : book.box ? 'Light' : 'No box'}
                  </Button>
                }
              >
                {(book.match_reasons.length > 0 || book.notes || book.archive_publication) && (
                <div className="space-y-3">
                  {book.notes && <p className="text-sm leading-6 text-[var(--ink-muted)]">{book.notes}</p>}

                  {book.match_reasons.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {book.match_reasons.map(reason => (
                        <li
                          key={`${reason.type}-${reason.label}-${reason.detail}`}
                          className="pill bg-[var(--accent)]/20 text-[var(--ink)]"
                        >
                          {formatReason(reason)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {book.archive_publication && (
                    <div className="surface-card p-3 text-sm text-[var(--ink-muted)]">
                      <p className="font-semibold text-[var(--ink)]">{book.archive_publication.title}</p>
                      <p className="mt-1">{book.archive_publication.authors.join(', ')}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {book.archive_publication.topics_preview.slice(0, 4).map(topic => (
                          <button
                            key={topic.id}
                            type="button"
                            className="pill hover:border-[var(--accent-strong)] hover:text-[var(--ink)]"
                            onClick={() => handleTopicSearch(topic.path)}
                          >
                            {topic.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}
              </BookRow>
            ))}

            {books.hasMore && (
              <Button tone="ghost" onClick={() => void books.showMore()} disabled={books.isLoadingMore}>
                {books.isLoadingMore ? 'Loading…' : `Show ${books.nextPageCount} more`}
              </Button>
            )}

            {!books.isLoading && books.items.length === 0 && (
              <div className="dashed-note">
                No books matched that query yet. Link more archive metadata in{' '}
                <Link to="/manage/books" className="font-semibold text-[var(--forest-ink)]">
                  Manage
                </Link>{' '}
                to improve topic search.
              </div>
            )}
          </div>
        </section>

        {books.error && (
          <div className="panel border-[var(--danger)]/25 text-sm text-[var(--danger)]">{books.error}</div>
        )}
      </div>

      <aside className="flex flex-col gap-6">
        <section className="panel hidden md:block">
          <p className="section-kicker">Topics</p>
          <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">Quick filters</h2>
          <Input
            name="topic-filter"
            label="Filter topics"
            type="search"
            placeholder="e.g. cards"
            value={topicFilter}
            onChange={event => setTopicFilter(event.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {filteredTopics.map(topic => (
              <button
                key={topic.id}
                type="button"
                className="pill hover:border-[var(--accent-strong)] hover:text-[var(--ink)]"
                onClick={() => void handleTopicSearch(topic.path)}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="section-kicker">Highlight</p>
          <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">Shelf highlight</h2>
          <label className="field mt-4">
            <span className="field-label">Highlight color</span>
            <input
              aria-label="Highlight color"
              className="field-input h-12 p-2"
              type="color"
              value={highlightColor}
              onChange={event => {
                setHighlightColor(event.target.value)
                previewHighlight(event.target.value)
              }}
            />
          </label>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            {lightingState?.highlight_box_id
              ? 'The lit box follows this color as you drag it.'
              : 'Light a book to preview this color on the shelf.'}
          </p>
        </section>

        <section className="panel">
          <p className="section-kicker">Scenes</p>
          <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">Ambient control</h2>

          <div className="mt-4 flex flex-col gap-4">
            <label className="field">
              <span className="field-label">Scene</span>
              <select className="field-input" value={sceneName} onChange={event => setSceneName(event.target.value as SceneName)}>
                {sceneOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {sceneName === 'solid' && (
              <label className="field">
                <span className="field-label">Solid color</span>
                <input
                  className="field-input h-12 p-2"
                  type="color"
                  value={sceneColor}
                  onChange={event => {
                    setSceneColor(event.target.value)
                    previewScene()
                  }}
                />
              </label>
            )}

            {sceneName === 'checkerboard' && (
              <>
                <label className="field">
                  <span className="field-label">Color A</span>
                  <input
                    className="field-input h-12 p-2"
                    type="color"
                    value={checkerColorA}
                    onChange={event => {
                      setCheckerColorA(event.target.value)
                      previewScene()
                    }}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Color B</span>
                  <input
                    className="field-input h-12 p-2"
                    type="color"
                    value={checkerColorB}
                    onChange={event => {
                      setCheckerColorB(event.target.value)
                      previewScene()
                    }}
                  />
                </label>
              </>
            )}

            {sceneName === 'rainbow' && (
              <>
                <label className="field">
                  <span className="field-label">Speed (cycles/s)</span>
                  <input
                    className="field-input"
                    type="number"
                    step="0.05"
                    min="0"
                    value={rainbowSpeed}
                    onChange={event => setRainbowSpeed(Number(event.target.value) || 0)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Spread (cycles across shelf)</span>
                  <input
                    className="field-input"
                    type="number"
                    step="0.5"
                    min="0"
                    value={rainbowScale}
                    onChange={event => setRainbowScale(Number(event.target.value) || 0)}
                  />
                </label>
              </>
            )}

            {sceneName === 'swipe' && (
              <>
                <label className="field">
                  <span className="field-label">Swipe color</span>
                  <input
                    className="field-input h-12 p-2"
                    type="color"
                    value={swipeColor}
                    onChange={event => {
                      setSwipeColor(event.target.value)
                      previewScene()
                    }}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Speed (sweeps/s)</span>
                  <input
                    className="field-input"
                    type="number"
                    step="0.1"
                    min="0"
                    value={swipeSpeed}
                    onChange={event => setSwipeSpeed(Number(event.target.value) || 0)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Direction</span>
                  <select
                    className="field-input"
                    value={swipeDirection}
                    onChange={event => setSwipeDirection(event.target.value as 'right' | 'left')}
                  >
                    <option value="right">Left to right</option>
                    <option value="left">Right to left</option>
                  </select>
                </label>
              </>
            )}

            <Button tone="secondary" onClick={() => void handleApplyScene()} disabled={sceneBusy}>
              {sceneBusy ? 'Updating...' : 'Apply scene'}
            </Button>
            <Button tone="ghost" onClick={() => void handleClearHighlight()} disabled={sceneBusy}>
              Clear highlight
            </Button>
          </div>
        </section>
      </aside>
    </div>
  )
}
