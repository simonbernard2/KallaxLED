import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Button from '~/utils/components/button/button'
import Input from '~/utils/components/input/input'
import {
  createBook,
  deleteBook,
  exportBooksCsv,
  getGrid,
  importBookArchive,
  importBooksCsv,
  linkBookArchive,
  listBooks,
  updateBook,
  type Book,
  type Grid,
} from '~/utils/api'
import { joinCommaList, splitCommaList } from '~/utils/utils'

interface BookDraft {
  title: string
  author: string
  isbn: string
  userTags: string
  notes: string
  boxId: string
}

const emptyDraft: BookDraft = {
  title: '',
  author: '',
  isbn: '',
  userTags: '',
  notes: '',
  boxId: '',
}

const toDraft = (book: Book): BookDraft => ({
  title: book.title,
  author: book.author,
  isbn: book.isbn ?? '',
  userTags: joinCommaList(book.user_tags),
  notes: book.notes ?? '',
  boxId: book.box?.id ? `${book.box.id}` : '',
})

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [grid, setGrid] = useState<Grid | null>(null)
  const [query, setQuery] = useState('')
  const [createDraft, setCreateDraft] = useState<BookDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<BookDraft>(emptyDraft)
  const [archiveSources, setArchiveSources] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const boxes = useMemo(
    () => (grid ? grid.boxes.flat().filter((box): box is typeof box & { id: number } => box.id != null) : []),
    [grid]
  )

  const loadBooksPage = async (nextQuery = query) => {
    setIsLoading(true)
    setError(null)

    try {
      const [booksResult, gridResult] = await Promise.all([listBooks(nextQuery), getGrid()])
      setBooks(booksResult)
      setGrid(gridResult)
      setArchiveSources(prev => {
        const next = { ...prev }
        booksResult.forEach(book => {
          next[book.id] = next[book.id] ?? book.archive_publication?.source_url ?? ''
        })
        return next
      })
    } catch {
      setError('Books could not be loaded.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadBooksPage('')
  }, [])

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await loadBooksPage(query)
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus(null)

    try {
      await createBook({
        title: createDraft.title,
        author: createDraft.author,
        isbn: createDraft.isbn || null,
        user_tags: splitCommaList(createDraft.userTags),
        notes: createDraft.notes || null,
        box_id: createDraft.boxId ? Number(createDraft.boxId) : null,
      })
      setCreateDraft(emptyDraft)
      setStatus('Book created.')
      await loadBooksPage(query)
    } catch {
      setError('Book creation failed.')
    }
  }

  const startEditing = (book: Book) => {
    setEditingId(book.id)
    setEditDraft(toDraft(book))
    setArchiveSources(prev => ({ ...prev, [book.id]: prev[book.id] ?? book.archive_publication?.source_url ?? '' }))
  }

  const handleSave = async (bookId: number) => {
    setError(null)
    setStatus(null)

    try {
      await updateBook(bookId, {
        title: editDraft.title,
        author: editDraft.author,
        isbn: editDraft.isbn || null,
        user_tags: splitCommaList(editDraft.userTags),
        notes: editDraft.notes || null,
        box_id: editDraft.boxId ? Number(editDraft.boxId) : null,
      })
      setEditingId(null)
      setStatus('Book updated.')
      await loadBooksPage(query)
    } catch {
      setError('Book update failed.')
    }
  }

  const handleDelete = async (bookId: number) => {
    setError(null)
    setStatus(null)

    try {
      await deleteBook(bookId)
      setStatus('Book deleted.')
      if (editingId === bookId) setEditingId(null)
      await loadBooksPage(query)
    } catch {
      setError('Book deletion failed.')
    }
  }

  const handleArchiveLink = async (bookId: number) => {
    setError(null)
    setStatus(null)

    try {
      const response = await linkBookArchive(bookId, archiveSources[bookId] ?? '')
      setStatus(`Linked ${response.preview.title}.`)
      setArchiveSources(prev => ({ ...prev, [bookId]: response.preview.source_url }))
      await loadBooksPage(query)
    } catch {
      setError('Archive link failed. Use a Conjuring Archive medium URL or numeric id.')
    }
  }

  const handleArchiveImport = async (bookId: number) => {
    setError(null)
    setStatus(null)

    try {
      await importBookArchive(bookId)
      setStatus('Archive metadata imported.')
      await loadBooksPage(query)
    } catch {
      setError('Archive import failed.')
    }
  }

  const handleCsvImport = async (file: File) => {
    setError(null)
    setStatus(null)

    try {
      const result = await importBooksCsv(file)
      setStatus(`Imported ${result.created} books, skipped ${result.skipped}.`)
      await loadBooksPage(query)
    } catch {
      setError('CSV import failed.')
    }
  }

  const handleCsvExport = async () => {
    setError(null)
    setStatus(null)

    try {
      const blob = await exportBooksCsv()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'books.csv'
      anchor.click()
      window.URL.revokeObjectURL(url)
      setStatus('Export started.')
    } catch {
      setError('CSV export failed.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Manage books</p>
            <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">Library catalog and archive links</h2>
          </div>

          <form className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl" onSubmit={handleSearch}>
            <Input
              name="book-query"
              label="Search catalog"
              type="search"
              placeholder="Search local books or imported metadata"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <div className="flex items-end gap-3 sm:min-w-56">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
              <Button
                tone="ghost"
                className="w-full"
                onClick={() => {
                  setQuery('')
                  void loadBooksPage('')
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button tone="secondary" onClick={() => void handleCsvExport()}>
            Export CSV
          </Button>
          <label className="button-base cursor-pointer rounded-full bg-white/70 text-[var(--ink-muted)] ring-1 ring-black/10 hover:bg-white">
            Import CSV
            <input
              className="hidden"
              type="file"
              accept=".csv,text/csv"
              onChange={event => {
                const file = event.target.files?.[0]
                if (file) void handleCsvImport(file)
                event.currentTarget.value = ''
              }}
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <p className="section-kicker">Add book</p>
        <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleCreate}>
          <Input
            name="create-title"
            label="Title"
            value={createDraft.title}
            onChange={event => setCreateDraft(prev => ({ ...prev, title: event.target.value }))}
          />
          <Input
            name="create-author"
            label="Author"
            value={createDraft.author}
            onChange={event => setCreateDraft(prev => ({ ...prev, author: event.target.value }))}
          />
          <Input
            name="create-isbn"
            label="ISBN"
            value={createDraft.isbn}
            onChange={event => setCreateDraft(prev => ({ ...prev, isbn: event.target.value }))}
          />
          <Input
            name="create-tags"
            label="Personal tags"
            placeholder="mentalism, gambling, cards"
            value={createDraft.userTags}
            onChange={event => setCreateDraft(prev => ({ ...prev, userTags: event.target.value }))}
          />

          <label className="field">
            <span className="field-label">Shelf box</span>
            <select
              className="field-input"
              value={createDraft.boxId}
              onChange={event => setCreateDraft(prev => ({ ...prev, boxId: event.target.value }))}
            >
              <option value="">Unassigned</option>
              {boxes.map(box => (
                <option key={box.id} value={box.id}>
                  Box {box.x}, {box.y}
                </option>
              ))}
            </select>
          </label>

          <label className="field lg:col-span-2">
            <span className="field-label">Notes</span>
            <textarea
              className="field-input min-h-28 resize-y"
              value={createDraft.notes}
              onChange={event => setCreateDraft(prev => ({ ...prev, notes: event.target.value }))}
            />
          </label>

          <div className="lg:col-span-2">
            <Button type="submit" tone="secondary">
              Add book
            </Button>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        {books.map(book => (
          <article key={book.id} className="panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-[var(--ink)]">{book.title}</h3>
                  <p className="text-sm text-[var(--ink-muted)]">{book.author}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {book.box ? (
                    <span className="pill bg-[var(--forest)]/10 text-[var(--forest)]">
                      Box {book.box.x}, {book.box.y}
                    </span>
                  ) : (
                    <span className="pill">Unassigned</span>
                  )}
                  {book.user_tags.map(tag => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))}
                </div>
                {book.notes && <p className="text-sm leading-6 text-[var(--ink-muted)]">{book.notes}</p>}
                {book.archive_publication && (
                  <div className="rounded-3xl bg-[var(--forest-strong)]/6 p-4 text-sm text-[var(--ink-muted)]">
                    <p className="font-semibold text-[var(--ink)]">{book.archive_publication.title}</p>
                    <p className="mt-1">{book.archive_publication.authors.join(', ')}</p>
                    <p className="mt-2">
                      {book.archive_publication.entry_count} indexed entries linked to this shelf book.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {book.archive_publication.topics_preview.map(topic => (
                        <span key={topic.id} className="pill">
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button tone="ghost" onClick={() => startEditing(book)}>
                  Edit
                </Button>
                <Button tone="danger" onClick={() => void handleDelete(book.id)}>
                  Delete
                </Button>
              </div>
            </div>

            {editingId === book.id && (
              <div className="mt-5 grid gap-4 rounded-[28px] border border-black/8 bg-white/60 p-4 lg:grid-cols-2">
                <Input
                  name={`edit-title-${book.id}`}
                  label="Title"
                  value={editDraft.title}
                  onChange={event => setEditDraft(prev => ({ ...prev, title: event.target.value }))}
                />
                <Input
                  name={`edit-author-${book.id}`}
                  label="Author"
                  value={editDraft.author}
                  onChange={event => setEditDraft(prev => ({ ...prev, author: event.target.value }))}
                />
                <Input
                  name={`edit-isbn-${book.id}`}
                  label="ISBN"
                  value={editDraft.isbn}
                  onChange={event => setEditDraft(prev => ({ ...prev, isbn: event.target.value }))}
                />
                <Input
                  name={`edit-tags-${book.id}`}
                  label="Personal tags"
                  value={editDraft.userTags}
                  onChange={event => setEditDraft(prev => ({ ...prev, userTags: event.target.value }))}
                />

                <label className="field">
                  <span className="field-label">Shelf box</span>
                  <select
                    className="field-input"
                    value={editDraft.boxId}
                    onChange={event => setEditDraft(prev => ({ ...prev, boxId: event.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {boxes.map(box => (
                      <option key={box.id} value={box.id}>
                        Box {box.x}, {box.y}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field lg:col-span-2">
                  <span className="field-label">Notes</span>
                  <textarea
                    className="field-input min-h-28 resize-y"
                    value={editDraft.notes}
                    onChange={event => setEditDraft(prev => ({ ...prev, notes: event.target.value }))}
                  />
                </label>

                <label className="field lg:col-span-2">
                  <span className="field-label">Conjuring Archive URL or medium id</span>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      className="field-input flex-1"
                      type="url"
                      value={archiveSources[book.id] ?? ''}
                      onChange={event => setArchiveSources(prev => ({ ...prev, [book.id]: event.target.value }))}
                      placeholder="https://www.conjuringarchive.com/list/medium/140"
                    />
                    <Button tone="ghost" onClick={() => void handleArchiveLink(book.id)}>
                      Link archive
                    </Button>
                    <Button tone="secondary" onClick={() => void handleArchiveImport(book.id)}>
                      Import metadata
                    </Button>
                  </div>
                </label>

                <div className="flex flex-wrap gap-2 lg:col-span-2">
                  <Button tone="secondary" onClick={() => void handleSave(book.id)}>
                    Save changes
                  </Button>
                  <Button tone="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </article>
        ))}

        {!isLoading && books.length === 0 && (
          <div className="panel text-sm text-[var(--ink-muted)]">No books yet. Add your first shelf title above.</div>
        )}
      </section>

      {status && <div className="panel text-sm text-[var(--forest)]">{status}</div>}
      {error && <div className="panel text-sm text-[#7b332c]">{error}</div>}
    </div>
  )
}
