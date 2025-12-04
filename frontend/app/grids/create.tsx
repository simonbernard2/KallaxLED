import { useEffect, useState, type FormEventHandler } from "react"
import useAxios from "axios-hooks"
import { Navigate } from "react-router"
import { type Grid, createBoxes } from "../utils/api"
import GridPreview from "./components/grid"

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
        <div className="grid grid-cols-2 gap-4 w-lg">
          <label htmlFor="gridName" className="font-medium text-white">
            Grid name
          </label>
          <input
            id="gridName"
            name="gridName"
            value={gridName}
            onChange={(e) => setGridName(e.target.value)}
            className="bg-gray-800 p-1.5 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
          />
          <label htmlFor="gridWidth" className="font-medium text-white">
            Number of boxes horizontally
          </label>
          <input
            id="gridWidth"
            name="gridWidth"
            type="number"
            min={1}
            max={7}
            value={gridWidth}
            onChange={(e) => setGridWitdh(parseInt(e.target.value))}
            className="bg-gray-800 p-1.5 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
          />

          <label htmlFor="gridHeight" className="font-medium text-white">
            Number of boxes vertically
          </label>
          <input
            id="gridHeight"
            name="gridHeight"
            type="number"
            min={1}
            max={7}
            value={gridHeight}
            onChange={(e) => setGridHeight(parseInt(e.target.value))}
            className="bg-gray-800 p-1.5 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
          />
          <button type="submit">Save</button>
        </div>
      </form>
      <div className="mt-10">
        <GridPreview grid={gridPreview} preview disabled />
      </div>
    </>
  )
}

export default CreateGrid
