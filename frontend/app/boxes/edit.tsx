import useAxios from "axios-hooks";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CurrentGridProvider, useCurrentGrid } from "~/grids/context/currentGridProvider"
import { addBookToBox, removeBookFromBox, type Book, type Box, type Grid } from "~/utils/api";
import Button from "~/utils/components/button/button";

const EditBox = () => {
  const currentGrid = useCurrentGrid();
  const [grid, SetGrid] = useState(currentGrid)
  const { boxId } = useParams();
  const box = grid.boxes.find((row: Box[]) => row.find((b: Box) => b.id === boxId))?.find(box => box.id === boxId)
  if (!box) return <div>Error</div>
  const navigate = useNavigate()

  const [books, setBooks] = useState(box.books)

  console.log("grid", grid)
  console.log("boxId", boxId)
  console.log("box", box)

  const [{ data: putData, loading: putLoading, error: putError },
    putGrid
  ] = useAxios<Grid, Grid>(
    {
      url: `/grids/${grid.id}`,
      method: "PUT"
    },
    { manual: true }
  );

  const handleSave = async () => {
    putGrid({
      data: {
        ...grid,
        boxes: addBookToBox(grid, { title: "efioawfhjfioaeweaw", author: { firstName: "Pifaille", lastName: "Bernard" } }, boxId!),
      }
    });
  }

  const handleRemoveBook = async (book: Book) => {
    putGrid({
      data: {
        ...grid,
        boxes: removeBookFromBox(grid, book, boxId!),
      }
    });
  }


  return (
    <>
      <h1 className="text-xl">Books</h1>
      {books.length > 0 &&
        <div
          className="mt-10 relative overflow-x-auto bg-neutral-primary-soft shadow-xl rounded-xl border dark:border-neutral-500 border-neutral-300 w-2xl">
          <table className="w-full text-sm text-left rtl:text-right text-body">
            <thead className="dark:bg-neutral-700 border-b border-default text-lg">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {books!.map((book) => (
                <tr key={grid.id}
                  className="odd:bg-neutral-200 
                  dark:odd:bg-neutral-500 
                  even:bg-neutral-100 
                  dark:even:bg-neutral-400 
                  border-b 
                  last:border-none 
                  dark:hover:bg-neutral-300 
                  dark:hover:text-gray-800 
                  hover:bg-neutral-300 
                  transition duration-200">
                  <th scope="row" className="px-6 py-4 font-bold text-heading whitespace-nowrap">
                    {book.title}
                  </th>
                  <td className="px-6 py-4">
                    {book.author.firstName} {book.author.lastName}
                  </td>
                  <td className="px-6 py-4 dark:text-white" align="right">
                    <Button color="red" onClick={() => handleRemoveBook(book)}>delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      <div className="flex gap-2 mt-2">
        <Button color="green" onClick={handleSave}> Add Book</Button>
        <Button onClick={() => navigate(`/grids/${grid.id}/edit`)}>Go Back</Button>
      </div>
    </>
  )
}

export default () => (
  <CurrentGridProvider>
    <EditBox />
  </CurrentGridProvider>
)
