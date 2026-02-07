import { useState } from "react";
import useAxios from "axios-hooks";
import type { Route } from "./+types/home";
import type { Book, Grid } from "~/utils/api";
import Button from "~/utils/components/button/button";
import ColorPicker from "~/utils/components/colorPicker/components/colorPicker";
import type { ColorSwatchType } from "~/utils/components/colorPicker/types/colorPickerTypes";
import Input from "~/utils/components/input/input";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Kallax Lighting" },
    { name: "description", content: "Find books and light their boxes." },
  ];
}

const findBoxId = (grid: Grid | undefined, x: number, y: number): number | null => {
  if (!grid) return null
  for (const row of grid.boxes) {
    for (const box of row) {
      if (box.x === x && box.y === y && box.id) {
        return box.id
      }
    }
  }
  return null
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [color, setColor] = useState<[number, number, number]>([255, 255, 255])
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [isbn, setIsbn] = useState("")
  const [tags, setTags] = useState("")
  const [boxX, setBoxX] = useState(0)
  const [boxY, setBoxY] = useState(0)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [{ data: grid }] = useAxios<Grid>("/grid")

  const [{ data: books, loading: searchLoading, error: searchError }, searchBooks] = useAxios<Book[]>(
    { url: "/books", method: "GET" },
    { manual: true }
  )

  const [{ loading: highlightLoading, error: highlightError }, highlightBox] = useAxios(
    { url: "/lights/highlight", method: "POST" },
    { manual: true }
  )
  const [{ loading: clearLoading, error: clearError }, clearHighlight] = useAxios(
    { url: "/lights/clear", method: "POST" },
    { manual: true }
  )

  const [{ loading: createLoading, error: createError }, createBook] = useAxios(
    { url: "/books", method: "POST" },
    { manual: true }
  )

  const [{ data: importResult, loading: importLoading, error: importError }, importBooks] = useAxios(
    { url: "/books/import", method: "POST" },
    { manual: true }
  )

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await searchBooks({ params: { query } })
  }

  const handleColorSelect = (value: ColorSwatchType) => {
    setColor([value.rgb.red, value.rgb.green, value.rgb.blue])
  }

  const handleHighlight = async (book: Book) => {
    if (!book.box?.id) return
    await highlightBox({ data: { box_id: book.box.id, rgb: color } })
  }

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    const boxId = findBoxId(grid, boxX, boxY)
    if (!boxId) {
      setFormError("No box found for that position.")
      return
    }
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    await createBook({
      data: {
        title,
        author,
        isbn: isbn || null,
        tags: tagList,
        box_id: boxId,
      }
    })
  }

  const handleImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!importFile) return
    const formData = new FormData()
    formData.append("file", importFile)
    await importBooks({ data: formData })
  }

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Find a Book</h1>
        <form className="flex gap-2" onSubmit={handleSearch}>
          <input
            className="flex-1 bg-neutral-300 dark:bg-neutral-700 focus:outline-neutral-500 px-2 py-1 rounded"
            placeholder="Search by title, author, ISBN, or tag"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit">{searchLoading ? "Searching..." : "Search"}</Button>
        </form>
        <div className="flex items-center gap-4">
          <ColorPicker onClick={handleColorSelect} />
          <Button onClick={() => clearHighlight()} disabled={clearLoading || highlightLoading}>
            {clearLoading ? "Clearing..." : "Clear highlight"}
          </Button>
        </div>
        {searchError && <div>Error searching books.</div>}
        {highlightError && <div>Error highlighting box.</div>}
        {clearError && <div>Error clearing highlight.</div>}
        <div className="flex flex-col gap-2">
          {(books || []).map((book) => (
            <div key={book.id} className="flex items-center justify-between border rounded px-3 py-2">
              <div>
                <div className="font-semibold">{book.title}</div>
                <div className="text-sm text-neutral-500">{book.author}</div>
                {book.box && (
                  <div className="text-xs text-neutral-400">Box: {book.box.x}, {book.box.y}</div>
                )}
              </div>
              <Button onClick={() => handleHighlight(book)} disabled={!book.box?.id || highlightLoading}>
                Light up
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Add a Book</h2>
        {!grid && <div className="text-sm text-neutral-500">Create a grid before adding books.</div>}
        <form className="flex flex-col gap-3" onSubmit={handleManualSubmit}>
          <Input name="title" label="Title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input name="author" label="Author" type="text" value={author} onChange={(event) => setAuthor(event.target.value)} />
          <Input name="isbn" label="ISBN" type="text" value={isbn} onChange={(event) => setIsbn(event.target.value)} />
          <Input name="tags" label="Tags (comma separated)" type="text" value={tags} onChange={(event) => setTags(event.target.value)} />
          <div className="flex gap-4">
            <Input name="boxX" label="Box X" type="number" min={0} value={boxX} onChange={(event) => setBoxX(parseInt(event.target.value))} />
            <Input name="boxY" label="Box Y" type="number" min={0} value={boxY} onChange={(event) => setBoxY(parseInt(event.target.value))} />
          </div>
          {formError && <div className="text-sm text-red-500">{formError}</div>}
          {createError && <div className="text-sm text-red-500">Error saving book.</div>}
          <Button type="submit" disabled={createLoading || !grid}>{createLoading ? "Saving..." : "Save book"}</Button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Import Books (CSV)</h2>
        <form className="flex flex-col gap-2" onSubmit={handleImport}>
          <input type="file" accept=".csv" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} />
          <Button type="submit" disabled={importLoading || !importFile}>{importLoading ? "Importing..." : "Import CSV"}</Button>
        </form>
        {importError && <div className="text-sm text-red-500">Error importing CSV.</div>}
        {importResult && (
          <div className="text-sm text-neutral-500">
            Imported: {importResult.created}, Skipped: {importResult.skipped}
          </div>
        )}
        {importResult?.errors?.length > 0 && (
          <div className="text-sm text-red-500">
            {importResult.errors.slice(0, 3).map((error: string) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
