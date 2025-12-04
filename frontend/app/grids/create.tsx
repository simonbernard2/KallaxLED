import { useEffect, useState, type FormEventHandler } from "react"
import useAxios from "axios-hooks"
import { Navigate } from "react-router"
import { type Grid, createBoxes } from "../utils/api"
import GridPreview from "./components/grid"
import Input from "~/utils/components/input/input"

const CreateGrid = () => {
  const [gridWidth, setGridWitdh] = useState(1)
  const [gridHeight, setGridHeight] = useState(1)
  const [gridName, setGridName] = useState("New Grid")
  const [gridPreview, setGridPreview] = useState({ name: gridName, boxes: createBoxes(gridWidth, gridHeight) })

  useEffect(() => {
    setGridPreview({ name: gridName, boxes: createBoxes(gridWidth, gridHeight) })
  }, [gridHeight, gridWidth]
  )



  const [
    { data: createGridData },
    createGrid
  ] = useAxios<Grid, Grid>(
    {
      url: "/grids",
      method: "POST"
    },
    { manual: true }
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    createGrid({
      data: {
        name: gridName,
        boxes: createBoxes(gridWidth, gridHeight)
      }
    })
  }

  if (createGridData) {
    return <Navigate to={`/grids/${createGridData.id}/edit`} />
  }

  return (
    <>
      <form className="flex flex-col items-center justify-center p-md gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 w-lg">
          <Input name="gridName" value={gridName} onChange={(e) => setGridName(e.target.value)} label="Grid Name" type="text" />
          <Input name="gridWidth" value={gridWidth} onChange={(e) => setGridWitdh(parseInt(e.target.value))} label="Number of boxes horizontally" type="number" min={1} max={7} />
          <Input name="gridHeight" value={gridHeight} onChange={(e) => setGridHeight(parseInt(e.target.value))} label="Number of boxes horizontally" type="number" min={1} max={7} />
        </div>
        <button type="submit">Save</button>
      </form>
      <div className="mt-10">
        <GridPreview grid={gridPreview} preview disabled />
      </div>
    </>
  )
}

export default CreateGrid
