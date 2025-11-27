import useAxios from "axios-hooks";
import { Navigate, useParams } from "react-router"
import type { Grid, LED, Color } from "~/utils/api";
import GridComponent from "~/grids/components/grid";
import { useState } from "react";
import axios from "axios";


const LEDAssign = () => {
  const [ledID, setLedID] = useState(1)
  const [{ data: ledData, loading: ledLoading, error: ledError }, putLED] = useAxios<LED, Color>(
    {
      url: `/leds/${ledID}`,
      method: "PUT",
    },
    { manual: true }
  );

  const handlePrev = () => {
    setLedID(prevId => prevId - 1)
    putLED({
      data: {
        rgb: [10, 0, 0]
      }
    })
  }

  const handleNext = () => {
    setLedID(prevId => prevId + 1)
    putLED({
      data: {
        rgb: [10, 0, 0]
      }
    })
  }

  if (ledLoading || ledError) {
    return (
      <div>Loading</div>
    )
  }

  if (ledData) {
    console.log(ledData)
  }

  return (
    <div className="flex gap-4">
      <button onClick={handlePrev} className="bg-green-600 px-4 py-2 rounded cursor-pointer">Prev</button>
      <div className="bg-yellow-600 px-4 py-2 rounded cursor-pointer">{ledID}</div>
      <button onClick={handleNext} className="bg-red-600 px-4 py-2 rounded cursor-pointer">Next</button>
    </div>
  )

}

const UpdateGrid = () => {
  const { gridId } = useParams();
  const [{ data, loading, error }] = useAxios(`/grids/${gridId}`);
  const [assignMode, setAssignMode] = useState(false)
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
    setAssignMode(assignMode => !assignMode)
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
      <GridComponent grid={data} />
      <div className="flex gap-2">
        <button onClick={handleSave} className="bg-green-600 px-4 py-2 rounded cursor-pointer">save grid</button>
        <button onClick={handleAssignLEDs} className="bg-yellow-600 px-4 py-2 rounded cursor-pointer">assign LEDS</button>
        <button onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded cursor-pointer">delete grid</button>
      </div>
      {assignMode && <LEDAssign />}
    </div>
  )
}

export default UpdateGrid
