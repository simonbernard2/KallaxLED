import { startTransition, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { formatBoxLabel } from '~/grids/box-label'
import Button from '~/utils/components/button/button'
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
import { hexToRgbTuple } from '~/utils/utils'

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
]

const formatReason = (reason: MatchReason) => {
  if (!reason.detail) return `${reasonLabels[reason.type]}: ${reason.label}`
  return `${reasonLabels[reason.type]}: ${reason.label} • ${reason.detail}`
}

const formatLightingSummary = (lightingState: LightingState | null) => {
  if (!lightingState) return 'Ready to search and light a shelf.'
  if (lightingState.highlight_box_id) return `Highlight active on box #${lightingState.highlight_box_id}.`
  if (lightingState.active_scene === 'solid') return 'Solid scene is active across the shelf.'
  if (lightingState.active_scene) return `${lightingState.active_scene} scene is active.`
  return 'No scene or highlight is currently active.'
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [highlightColor, setHighlightColor] = useState('#ffcf7d')
  const [sceneName, setSceneName] = useState<SceneName>('off')
  const [sceneColor, setSceneColor] = useState('#c79745')
  const [results, setResults] = useState<BookSearchResult[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicFilter, setTopicFilter] = useState('')
  const [lightingState, setLightingState] = useState<LightingState | null>(null)
  const [isSearching, setIsSearching] = useState(true)
  const [busyBookId, setBusyBookId] = useState<number | null>(null)
  const [sceneBusy, setSceneBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFirstRender = useRef(true)

  const filteredTopics = useMemo(() => {
    if (!topicFilter) return topics
    const lower = topicFilter.toLowerCase()
    return topics.filter(t => t.name.toLowerCase().includes(lower) || t.path.toLowerCase().includes(lower))
  }, [topics, topicFilter])

  const loadDashboard = async (nextQuery = '') => {
    setIsSearching(true)
    setError(null)

    try {
      const [searchResults, state] = await Promise.all([searchBooks(nextQuery), getLightingState()])

      startTransition(() => {
        setResults(searchResults)
        setLightingState(state)
      })
    } catch {
      setError('The dashboard could not load. Check the API connection and try again.')
    } finally {
      setIsSearching(false)
    }
  }

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

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loadDashboard(query)
  }

  const handleTopicSearch = async (topicPath: string) => {
    setQuery(topicPath)
    await loadDashboard(topicPath)
  }

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

  const handleApplyScene = async () => {
    setSceneBusy(true)
    setError(null)
    try {
      const state =
        sceneName === 'solid'
          ? await applyScene(sceneName, { rgb: hexToRgbTuple(sceneColor) })
          : await applyScene(sceneName, {})
      setLightingState(state)
    } catch {
      setError('The scene could not be updated.')
    } finally {
      setSceneBusy(false)
    }
  }

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
              {formatLightingSummary(lightingState)}
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <Input
              name="book-search"
              label="Search"
              type="search"
              placeholder="The Paper Engine, packet tricks, false shuffle..."
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <div className="flex items-end gap-3 sm:min-w-52">
              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search shelf'}
              </Button>
              <Button
                tone="ghost"
                className="w-full"
                onClick={() => {
                  setQuery('')
                  void loadDashboard('')
                }}
              >
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
            </div>
            <Link to="/manage/books" className="text-sm font-semibold text-[var(--forest)]">
              Manage catalog
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {results.map(book => (
              <article key={book.id} className="rounded-[28px] border border-black/8 bg-white/70 p-4 shadow-[0_18px_40px_-34px_rgba(39,29,23,0.45)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--ink)]">{book.title}</h3>
                      <p className="text-sm text-[var(--ink-muted)]">{book.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {book.box ? (
                        <span className="pill bg-[var(--forest)]/10 text-[var(--forest)]">
                          {formatBoxLabel(book.box)}
                        </span>
                      ) : (
                        <span className="pill">No box assigned</span>
                      )}
                      {book.user_tags.map(tag => (
                        <span key={tag} className="pill">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {book.match_reasons.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {book.match_reasons.map(reason => (
                          <li key={`${reason.type}-${reason.label}-${reason.detail}`} className="pill bg-[var(--accent)]/20 text-[var(--ink)]">
                            {formatReason(reason)}
                          </li>
                        ))}
                      </ul>
                    )}

                    {book.archive_publication && (
                      <div className="rounded-3xl bg-[var(--forest-strong)]/6 p-3 text-sm text-[var(--ink-muted)]">
                        <p className="font-semibold text-[var(--ink)]">{book.archive_publication.title}</p>
                        <p className="mt-1">{book.archive_publication.authors.join(', ')}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {book.archive_publication.topics_preview.slice(0, 4).map(topic => (
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
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-3 lg:w-52">
                    <label className="field">
                      <span className="field-label">Highlight color</span>
                      <input
                        aria-label={`Highlight color for ${book.title}`}
                        className="field-input h-12 p-2"
                        type="color"
                        value={highlightColor}
                        onChange={event => setHighlightColor(event.target.value)}
                      />
                    </label>
                    <Button onClick={() => void handleHighlight(book)} disabled={!book.box || busyBookId === book.id}>
                      {busyBookId === book.id ? 'Lighting...' : book.box ? 'Light this shelf' : 'Assign a box first'}
                    </Button>
                  </div>
                </div>
              </article>
            ))}

            {!isSearching && results.length === 0 && (
              <div className="rounded-3xl border border-dashed border-black/10 bg-white/50 p-6 text-sm text-[var(--ink-muted)]">
                No books matched that query yet. Link more archive metadata in <Link to="/manage/books" className="font-semibold text-[var(--forest)]">Manage</Link> to improve topic search.
              </div>
            )}
          </div>
        </section>

        {error && <div className="panel border-[#7b332c]/20 text-sm text-[#7b332c]">{error}</div>}
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
                <input className="field-input h-12 p-2" type="color" value={sceneColor} onChange={event => setSceneColor(event.target.value)} />
              </label>
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
