import useAxios from "axios-hooks";
import { useNavigate } from "react-router"
import type { Grid } from "~/utils/api";
import { useEffect, useState } from "react";
import { CurrentGridProvider, useCurrentGrid } from "./context/currentGridProvider";
import Input from "~/utils/components/input/input";
import Button from "~/utils/components/button/button";

const EditGrid = () => {
  const grid = useCurrentGrid();
  const [gridName, setGridName] = useState(grid.name)
  const navigate = useNavigate()

  const [{ loading: putLoading, error: putError },
    putGrid
  ] = useAxios<Grid, { name: string }>(
    {
      url: `/grid`,
      method: "PUT"
    },
    { manual: true }
  );

  const handleSave = async () => {
    putGrid({
      data: {
        name: gridName,
      }
    });
  }

  if (putError) return (<div>Error</div>)

  useEffect(() => {
    setGridName(grid.name)
  }, [grid.name])

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
          <Button onClick={() => navigate(`/grid/assign-leds`)} >assign LEDs</Button>
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
