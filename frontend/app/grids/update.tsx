import useAxios from "axios-hooks";
import { Navigate, useParams } from "react-router"
import type { Grid, LED, Color } from "~/utils/api";
import GridComponent from "~/grids/components/grid";
import { useState } from "react";
import { addLEDtoBox } from "~/utils/api";

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

const UpdateGrid = () => {
  const { gridId } = useParams();
  const [{ data, loading, error }] = useAxios(`/grids/${gridId}`);
  const [assignLEDs, setAssignLEDs] = useState(false)
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

  const handleSave = () => null

  const handleAssignLEDs = () => {
    setAssignLEDs(assignLEDs => !assignLEDs)
  }

  if (loading || error || deleteLoading || deleteError) {
    return (
      <div>Loading</div>
    )
  }
  if (deleteData) {
    return <Navigate to="/grids" />
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <div>{data.name}</div>
      {!assignLEDs &&
        <>
          <GridComponent grid={data} />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-600 px-4 py-2 rounded cursor-pointer">save grid</button>
            <button onClick={handleAssignLEDs} className="bg-yellow-600 px-4 py-2 rounded cursor-pointer">assign LEDS</button>
            <button onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded cursor-pointer">delete grid</button>
          </div>
        </>
      }
      {assignLEDs && <LEDAssign grid={data} onExit={() => setAssignLEDs(false)} />}
    </div>
  )
}

export default UpdateGrid
