import useAxios from "axios-hooks";
import { useState } from "react";
import { addLEDtoBox, type Color, type Grid, type LED } from "~/utils/api";
import GridComponent from "~/grids/components/grid";
import { CurrentGridProvider, useCurrentGrid } from "./context/currentGridProvider";
import { useNavigate } from "react-router";
import Button from "~/utils/components/button/button";


const LEDAssign = () => {
  const currentGrid = useCurrentGrid();
  const navigate = useNavigate();
  const [ledID, setLedID] = useState(0)
  const [grid, setGrid] = useState(currentGrid)
  const [{ loading: ledLoading, error: ledError }, putLED] = useAxios<LED, Color>(
    { url: "/leds/0", method: "PUT", data: { rgb: [15, 0, 0] } }
  );
  const [{ }, saveGrid] = useAxios<Grid, Grid>(
    { url: `/grids/${grid.id}`, method: "PUT" }, { manual: true }
  )

  const handleLEDUpdate = async (offset: number) => {
    const nextId = ledID + offset
    if (nextId < 0 || nextId === 150) return;

    await putLED({
      url: `/leds/${nextId}`, data: {
        rgb: [15, 0, 0]
      }
    })
    setLedID(nextId);
  }

  const handleSave = async () => {
    await saveGrid({ data: grid })

    navigate("/grids");
  }

  const handleBoxClick = (i: number, j: number) => {
    setGrid((g: Grid) => {
      const updatedGrid = { ...g }
      const boxes = addLEDtoBox(updatedGrid, { id: ledID, rgb: [0, 0, 0] }, i, j)
      updatedGrid.boxes = boxes
      return updatedGrid
    }
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <GridComponent grid={grid} onClick={handleBoxClick} disabled={ledLoading || Boolean(ledError)} type="assignLED" />
      <div className="flex gap-4 items-center">
        <Button onClick={() => handleLEDUpdate(-1)} disabled={ledID === 0 || ledID === 150}>Prev</Button>
        {ledID}
        <Button onClick={() => handleLEDUpdate(1)}>Next</Button>
      </div>
      {ledError && <div>Error loading LED</div>}
      <div className="flex gap-4">
        <Button onClick={handleSave} color="green">Save</Button>
      </div>
    </div >
  )
}

export default () => (
  <CurrentGridProvider>
    <LEDAssign />
  </CurrentGridProvider>
);
