import useAxios from "axios-hooks";
import { Navigate, useNavigate, useParams } from "react-router"
import type { Grid } from "~/utils/api";
import GridComponent from "~/grids/components/grid";
import { useEffect, useState } from "react";
import { CurrentGridProvider, useCurrentGrid } from "./context/currentGridProvider";

const EditGrid = () => {
  const grid = useCurrentGrid();
  const [gridName, setGridName] = useState(grid.name)
  const navigate = useNavigate()

  const [{ data: putData, loading: putLoading, error: putError },
    putGrid
  ] = useAxios<Grid, Grid>(
    {
      url: `/grids/${grid.id}`,
      method: "PUT"
    },
    { manual: true }
  );

  const [{ data: deleteData, loading: deleteLoading, error: deleteError },
    deleteGrid
  ] = useAxios(
    {
      url: `/grids/${grid.id}`,
      method: "DELETE"
    },
    { manual: true }
  );

  const handleSave = async () => {
    putGrid({
      data: {
        ...grid,
        name: gridName,
      }
    });
  }

  if (putError || deleteError) return (<div>Error</div>)

  if (deleteData) {
    return <Navigate to="/grids" />
  }

  // TODO: create input and button components 
  return (
    <div className="flex flex-col gap-4">
      <>
        <div className="flex flex-col gap-4 items-start">
          <div className="flex gap-4 items-center">
            <label htmlFor="gridName">Name:</label>
            <input className="bg-neutral-700 px-2 py-1 focus:bg-neutral-600" type="text" name="gridName" value={gridName} onChange={(e) => setGridName(e.target.value)} />
          </div>
        </div>
        <GridComponent grid={grid} />
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-green-600 px-4 py-2 rounded cursor-pointer">
            {putLoading && "..."}
            {!putLoading && "save"}
          </button>
          <button onClick={() => navigate(`/grids/${grid.id}/assignLEDs`)} className="bg-yellow-600 px-4 py-2 rounded cursor-pointer">assign LEDS</button>
          <button onClick={() => deleteGrid()} className="bg-red-600 px-4 py-2 rounded cursor-pointer">
            {deleteLoading && "..."}
            {!deleteLoading && "delete"}
          </button>
        </div>
      </>
    </div>
  )
}

export default () => (
  <CurrentGridProvider>
    <EditGrid />
  </CurrentGridProvider>
);
