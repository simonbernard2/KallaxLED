import useAxios from "axios-hooks";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CurrentGridProvider, useCurrentGrid } from "~/grids/context/currentGridProvider"
import { addBookToBox, removeBookFromBox, type Box, type Grid } from "~/utils/api";
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
        boxes: addBookToBox(grid, { title: "Test", author: { firstName: "A", lastName: "B" } }, boxId!),
      }
    });
  }

  const handleRemoveBook = async () => {
    putGrid({
      data: {
        ...grid,
        boxes: removeBookFromBox(grid, { title: "Test", author: { firstName: "A", lastName: "B" } }, boxId!),
      }
    });
  }


  return (
    <div className="flex gap-2">
      <Button color="green" onClick={handleSave}> Add Book</Button>
      <Button color="red" onClick={handleRemoveBook}> Remove Book</Button>
      <Button onClick={() => navigate(`/grids/${grid.id}/edit`)}>Go Back</Button>
      {books.map((b) => b.title)}
    </div>

  )
}

export default () => (
  <CurrentGridProvider>
    <EditBox />
  </CurrentGridProvider>
)
