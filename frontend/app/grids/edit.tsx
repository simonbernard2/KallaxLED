import useAxios from "axios-hooks";
import { Navigate, useNavigate, useParams } from "react-router"
import type { Grid, LED, Color } from "~/utils/api";
import GridComponent from "~/grids/components/grid";
import { useEffect, useState } from "react";
import { addLEDtoBox, createBoxes } from "~/utils/api";

interface LEDAssignProps {
  grid: Grid
  onExit: () => void
}

const LEDAssign = (props: LEDAssignProps) => {
  const [ledID, setLedID] = useState(0)
  const [grid, setGrid] = useState(props.grid)
  const [{ error: ledError }, putLED] = useAxios<LED, Color>(
    { method: "PUT" },
    { manual: true }
  );
  const [, saveGrid] = useAxios<Grid, Grid>(
    { url: `/grids/${grid.id}`, method: "PUT" }
  )

  const handleNext = async (offset: number) => {
    const nextId = ledID + offset
    if (nextId < 0) return;
    if (nextId === 150) return;
    await handleUpdate(nextId)
    setLedID(nextId)
  }

  const handleUpdate = async (number: number) => {
    const nextId = number
    if (nextId < 0) return;
    if (nextId === 150) return;

    await putLED({
      url: `/leds/${nextId}`,
      data: {
        rgb: [10, 0, 0]
      }
    });

  }


  const handleSave = async () => {
    await saveGrid({ data: grid })
    props.onExit()
  }

  const handleBoxClick = (i: number, j: number) => {
    setGrid((g) => {
      const updatedGrid = { ...g }
      updatedGrid.boxes[i][j] = addLEDtoBox({ id: ledID, rgb: [0, 0, 0] }, updatedGrid.boxes[i][j])
      return updatedGrid
    }
    )
  }


  if (ledError) {
    return (
      <div>Error updating LED</div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <GridComponent grid={grid} onClick={handleBoxClick} />
      <div className="flex gap-4">
        <button onClick={() => handleNext(- 1)} className="bg-green-600 px-4 py-2 rounded cursor-pointer">Prev</button>
        {ledID}
        <button onClick={() => handleNext(1)} className="bg-red-600 px-4 py-2 rounded cursor-pointer">Next</button>
      </div>
      <div className="flex gap-4">
        <button onClick={handleSave} className="bg-gray-500 px-4 py-2 rounded cursor-pointer">Save</button>
        <button onClick={props.onExit} className="bg-gray-500 px-4 py-2 rounded cursor-pointer">Cancel</button>
      </div>
    </div >
  )
}

const EditGrid = () => {
  const { gridId } = useParams();
  const [assignLEDs, setAssignLEDs] = useState(false)
  const [gridName, setGridName] = useState('')
  const [gridWidth, setGridWidth] = useState(1)
  const [gridHeight, setGridHeight] = useState(1)
  const [dimensionChanged, setDimensionChanged] = useState(false)
  const [previewGrid, setPreviewGrid] = useState<Grid | null>(null)
  const [{ data, loading, error }] = useAxios(`/grids/${gridId}`);
  const navigate = useNavigate()

  const [{ data: putData, loading: putLoading, error: putError },
    putGrid
  ] = useAxios<Grid>(
    {
      url: `/grids/${gridId}`,
      method: "PUT"
    },
    { manual: true }
  );

  const [{ data: deleteData, loading: deleteLoading, error: deleteError },
    deleteGrid
  ] = useAxios<Grid>(
    {
      url: `/grids/${gridId}`,
      method: "DELETE"
    },
    { manual: true }
  );

  const handleDelete = () => {
    deleteGrid({
      data: {
        id: gridId,
      }
    })
  }

  // TODO: wondering if having several useEffect hooks is a code smell
  useEffect(() => {
    if (!data) return

    setGridName(data.name)
    setGridWidth(data.boxes[0].length) // TODO: make the height and width more intuitive, or abstract a function for it
    setGridHeight(data.boxes.length)
    setPreviewGrid({ ...data })
  }, [data])


  useEffect(() => {
    if (!previewGrid) return

    setPreviewGrid({ ...previewGrid, boxes: createBoxes(gridWidth, gridHeight) })
    setDimensionChanged(true)
  }, [gridWidth, gridHeight])

  useEffect(() => {
    if (!previewGrid) return

    setPreviewGrid({ ...previewGrid, name: gridName })
  }, [gridName])


  const handleSave = async () => {
    if (dimensionChanged) {
      setAssignLEDs(true)
      setDimensionChanged(false)
      return
    }
    await putGrid({
      data: previewGrid
    })
    navigate(`/grids/${gridId}`)
  }

  const handleAssignLEDs = () => {
    setAssignLEDs(assignLEDs => !assignLEDs)
  }

  if (error || deleteError) return (<div>Error</div>)
  if (loading || deleteLoading) return
  if (!previewGrid) return

  if (deleteData) {
    return <Navigate to="/grids" />
  }

  // TODO: create input and button components 
  return (
    <div className="flex flex-col gap-4">
      {!assignLEDs &&
        <>
          <div className="flex flex-col gap-4 items-start">
            <div className="flex gap-4 items-center">
              <label htmlFor="gridName">Name:</label>
              <input className="bg-neutral-700 px-2 py-1 focus:bg-neutral-600" type="text" name="gridName" value={gridName} onChange={(e) => setGridName(e.target.value)} />
            </div>
            <div className="flex gap-4 items-center">
              <label htmlFor="gridName">Width:</label>
              <input className="bg-neutral-700 px-2 py-1 focus:bg-neutral-600" type="number" name="gridWidth" min={1} max={7} value={gridWidth} onChange={(e) => setGridWidth(parseInt(e.target.value))} />
            </div>
            <div className="flex gap-4 items-center">
              <label htmlFor="gridName">Height:</label>
              <input className="bg-neutral-700 px-2 py-1 focus:bg-neutral-600" type="number" name="gridHeight" min={1} max={7} value={gridHeight} onChange={(e) => setGridHeight(parseInt(e.target.value))} />
            </div>
          </div>
          <GridComponent grid={previewGrid} />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-600 px-4 py-2 rounded cursor-pointer">save grid</button>
            <button onClick={handleAssignLEDs} className="bg-yellow-600 px-4 py-2 rounded cursor-pointer">assign LEDS</button>
            <button onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded cursor-pointer">delete grid</button>
          </div>
        </>
      }
      {assignLEDs && <LEDAssign grid={previewGrid} onExit={() => setAssignLEDs(false)} />}
    </div>
  )
}

export default EditGrid
