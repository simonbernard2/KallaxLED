import { useEffect, useMemo, useState, type FormEvent } from "react";
import useAxios from "axios-hooks";
import type { Book, BookCreatePayload, BookImportResult, BookUpdatePayload, Grid, BoxProps } from "~/utils/api";
import Button from "~/utils/components/button/button";
import Input from "~/utils/components/input/input";
import GridComponent from "~/grids/grid";

const buildTagList = (tags: string) =>
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

const toTagString = (tags: string[]) => tags.join(", ");

interface SelectBoxProps extends BoxProps {
  selectedBoxId: number | null
  onSelect: (boxId: number) => void
}

const SelectBox = ({ box, selectedBoxId, onSelect }: SelectBoxProps) => {
  const isSelected = box.id != null && box.id === selectedBoxId
  const hasLeds = box.leds.length > 0
  let className = "flex h-14 w-14 items-center justify-center border-2 text-xs"
  if (hasLeds) className += " bg-neutral-600 text-white"
  if (!hasLeds) className += " border-dashed text-neutral-500 bg-neutral-200 dark:bg-neutral-700"
  if (isSelected) className += " bg-amber-500 text-neutral-900"
  return (
    <div className={`${className} ${box.id ? "cursor-pointer" : ""}`} onClick={() => box.id && onSelect(box.id)}>
      {box.x}, {box.y}
    </div>
  )
}

const BooksPage = () => {
  const [{ data: grid }] = useAxios<Grid>("/grid");
  const flatBoxes = useMemo(() => {
    if (!grid) return [];
    return grid.boxes.flat().filter((box) => box.id != null);
  }, [grid]);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [tags, setTags] = useState("");
  const [boxId, setBoxId] = useState<number | "">("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<BookUpdatePayload>({});
  const selectedCreateBox = useMemo(() => {
    if (!boxId || !grid) return null;
    return flatBoxes.find((box) => box.id === boxId) ?? null;
  }, [boxId, flatBoxes, grid]);

  const [{ data: books, loading: booksLoading, error: booksError }, fetchBooks] = useAxios<Book[]>(
    { url: "/books", method: "GET" },
    { manual: true }
  );
  const [{ loading: createLoading, error: createError }, createBook] = useAxios(
    { url: "/books", method: "POST" },
    { manual: true }
  );
  const [{ loading: updateLoading, error: updateError }, updateBook] = useAxios(
    { method: "PUT" },
    { manual: true }
  );
  const [{ loading: deleteLoading, error: deleteError }, deleteBook] = useAxios(
    { method: "DELETE" },
    { manual: true }
  );
  const [{ data: importResult, loading: importLoading, error: importError }, importBooks] = useAxios<BookImportResult>(
    { url: "/books/import", method: "POST" },
    { manual: true }
  );

  useEffect(() => {
    void fetchBooks({ params: { query: "" } }).catch(() => undefined);
  }, [fetchBooks]);

  const refreshBooks = async () => {
    await fetchBooks({ params: { query } });
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await refreshBooks();
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!boxId) return;
    const payload: BookCreatePayload = {
      title,
      author,
      isbn: isbn || null,
      tags: buildTagList(tags),
      box_id: Number(boxId),
    };
    await createBook({ data: payload });
    setTitle("");
    setAuthor("");
    setIsbn("");
    setTags("");
    setBoxId("");
    await refreshBooks();
  };

  const startEdit = (book: Book) => {
    setEditingId(book.id ?? null);
    setEditDraft({
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? null,
      tags: book.tags,
      box_id: book.box?.id ?? null,
    });
  };

  const handleUpdate = async (bookId: number) => {
    await updateBook({ url: `/books/${bookId}`, data: editDraft });
    setEditingId(null);
    setEditDraft({});
    await refreshBooks();
  };

  const handleDelete = async (bookId: number) => {
    await deleteBook({ url: `/books/${bookId}` });
    await refreshBooks();
  };

  const handleImport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!importFile) return;
    const formData = new FormData();
    formData.append("file", importFile);
    await importBooks({ data: formData });
    await refreshBooks();
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-4xl">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Books</h1>
        <form className="flex gap-2" onSubmit={handleSearch}>
          <input
            className="flex-1 bg-neutral-300 dark:bg-neutral-700 focus:outline-neutral-500 px-2 py-1 rounded"
            placeholder="Search by title, author, ISBN, or tag"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit">{booksLoading ? "Searching..." : "Search"}</Button>
        </form>
        {booksError && <div className="text-sm text-red-500">Error loading books.</div>}
        <div className="flex flex-col gap-2">
          {(books || []).map((book) => (
            <div key={book.id} className="border rounded px-3 py-2 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{book.title}</div>
                  <div className="text-sm text-neutral-500">{book.author}</div>
                  {book.box && (
                    <div className="text-xs text-neutral-400">Box: {book.box.x}, {book.box.y}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => startEdit(book)} disabled={updateLoading}>Edit</Button>
                  <Button onClick={() => handleDelete(book.id!)} color="red" disabled={deleteLoading}>Delete</Button>
                </div>
              </div>

              {editingId === book.id && (
                <div className="flex flex-col gap-2">
                  <Input
                    name="editTitle"
                    label="Title"
                    type="text"
                    value={editDraft.title ?? ""}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  <Input
                    name="editAuthor"
                    label="Author"
                    type="text"
                    value={editDraft.author ?? ""}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, author: event.target.value }))}
                  />
                  <Input
                    name="editIsbn"
                    label="ISBN"
                    type="text"
                    value={editDraft.isbn ?? ""}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, isbn: event.target.value }))}
                  />
                  <Input
                    name="editTags"
                    label="Tags"
                    type="text"
                    value={toTagString(editDraft.tags ?? [])}
                    onChange={(event) => setEditDraft((prev) => ({ ...prev, tags: buildTagList(event.target.value) }))}
                  />
                  {grid ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-neutral-500">
                        Selected box: {(() => {
                          const selected = flatBoxes.find((box) => box.id === editDraft.box_id);
                          return selected ? `${selected.x}, ${selected.y}` : "Unassigned";
                        })()}
                      </div>
                      <GridComponent
                        grid={grid}
                        BoxComponent={SelectBox}
                        boxComponentProps={{
                          selectedBoxId: editDraft.box_id ?? null,
                          onSelect: (id: number) => setEditDraft((prev) => ({ ...prev, box_id: id })),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500">Create a grid to assign boxes.</div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(book.id!)} disabled={updateLoading}>
                      {updateLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                  {updateError && <div className="text-sm text-red-500">Error updating book.</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Add a Book</h2>
        {!grid && <div className="text-sm text-neutral-500">Create a grid before adding books.</div>}
        <form className="flex flex-col gap-3" onSubmit={handleCreate}>
          <Input name="title" label="Title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input name="author" label="Author" type="text" value={author} onChange={(event) => setAuthor(event.target.value)} />
          <Input name="isbn" label="ISBN" type="text" value={isbn} onChange={(event) => setIsbn(event.target.value)} />
          <Input name="tags" label="Tags (comma separated)" type="text" value={tags} onChange={(event) => setTags(event.target.value)} />
          {grid ? (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-neutral-500">
                Selected box: {selectedCreateBox ? `${selectedCreateBox.x}, ${selectedCreateBox.y}` : "None"}
              </div>
              <GridComponent
                grid={grid}
                BoxComponent={SelectBox}
                boxComponentProps={{
                  selectedBoxId: boxId === "" ? null : boxId,
                  onSelect: (id: number) => setBoxId(id),
                }}
              />
            </div>
          ) : null}
          {createError && <div className="text-sm text-red-500">Error saving book.</div>}
          <Button type="submit" disabled={createLoading || !grid || !boxId}>
            {createLoading ? "Saving..." : "Save book"}
          </Button>
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
            {importResult.errors.slice(0, 3).map((error) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        )}
      </section>

      {(deleteError || updateError) && !editingId && (
        <div className="text-sm text-red-500">Error updating books.</div>
      )}
    </div>
  );
};

export default BooksPage;
