import { useEffect, useState, type FormEventHandler } from "react"
import useAxios from "axios-hooks"
import { Navigate } from "react-router"
import { type Grid, createBoxes } from "../../utils/api"
import GridPreview from "../grid"
import Input from "~/utils/components/input/input"
import Button from "~/utils/components/button/button"
import PreviewBox from "./box"

const CreateGrid = () => {
  const [gridWidth, setGridWitdh] = useState(1)
  const [gridHeight, setGridHeight] = useState(1)
  const [gridName, setGridName] = useState("New Grid")
  const [gridPreview, setGridPreview] = useState({
    name: gridName,
    width: gridWidth,
    height: gridHeight,
    boxes: createBoxes(gridWidth, gridHeight),
  })

  useEffect(() => {
    setGridPreview({
      name: gridName,
      width: gridWidth,
      height: gridHeight,
      boxes: createBoxes(gridWidth, gridHeight),
    })
  }, [gridHeight, gridWidth, gridName]
  )

  const [
    { data: createGridData },
    createGrid
  ] = useAxios<Grid, { name: string; width: number; height: number }>(
    {
      url: "/grid",
      method: "POST"
    },
    { manual: true }
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    createGrid({
      data: {
        name: gridName,
        width: gridWidth,
        height: gridHeight,
      }
    })
  }

  if (createGridData) {
    return <Navigate to="/grid/edit" />
  }

  return (
    <>
      <form className="flex flex-col items-center justify-center p-md gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 w-lg">
          <Input name="gridName" value={gridName} onChange={(e) => setGridName(e.target.value)} label="Grid Name" type="text" />
          <Input name="gridWidth" value={gridWidth} onChange={(e) => setGridWitdh(parseInt(e.target.value))} label="Number of boxes horizontally" type="number" min={1} max={7} />
          <Input name="gridHeight" value={gridHeight} onChange={(e) => setGridHeight(parseInt(e.target.value))} label="Number of boxes vertically" type="number" min={1} max={7} />
        </div>
        <Button color="green" type="submit">Save</Button>
      </form>
      <div className="mt-10">
        <GridPreview grid={gridPreview} boxComponentProps={{}} BoxComponent={PreviewBox} />
      </div>
    </>
  )
}

export default CreateGrid
