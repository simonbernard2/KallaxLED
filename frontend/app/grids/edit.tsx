import useAxios from "axios-hooks";
import { Navigate, useNavigate } from "react-router"
import type { Grid } from "~/utils/api";
import { useState } from "react";
import { CurrentGridProvider, useCurrentGrid } from "./context/currentGridProvider";
import Input from "~/utils/components/input/input";
import Button from "~/utils/components/button/button";

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

  return (
    <div className="flex flex-col gap-4">
      <>
        <div className="flex flex-col gap-4 items-start">
          <div className="flex gap-4 items-center">
            <Input name="gridName" label="Name" value={gridName} type="text" onChange={(e) => setGridName(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button color="green" onClick={handleSave}> {putLoading && "..."} {!putLoading && "save"} </Button>
          <Button onClick={() => navigate(`/grids/${grid.id}/assignLEDs`)} >assign LEDs</Button>
          <Button color="red" onClick={() => deleteGrid()}> {deleteLoading && "..."} {!deleteLoading && "delete"} </Button>
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
