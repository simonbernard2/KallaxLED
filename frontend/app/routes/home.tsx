import { useState, type FormEvent } from "react";
import useAxios from "axios-hooks";
import type { Route } from "./+types/home";
import type { Book } from "~/utils/api";
import Button from "~/utils/components/button/button";
import ColorPicker from "~/utils/components/colorPicker/components/colorPicker";
import type { ColorSwatchType } from "~/utils/components/colorPicker/types/colorPickerTypes";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Kallax Lighting" },
    { name: "description", content: "Find books and light their boxes." },
  ];
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [color, setColor] = useState<[number, number, number]>([255, 255, 255])

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

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
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

    </div>
  )
}
