import useAxios from "axios-hooks";
import { Link } from "react-router"
import type { Grid } from "~/utils/api";
import GridComponent from "~/grids/components/grid";
import { useState } from "react";
import { setBoxLEDsRGB } from "~/utils/api";
import ColorPicker from "~/utils/components/colorPicker/components/colorPicker";
import type { ColorSwatchType } from "~/utils/components/colorPicker/types/colorPickerTypes";
import { CurrentGridProvider, useCurrentGrid } from "./context/currentGridProvider";
import Button from "~/utils/components/button/button";
import { NormalBox } from "./components/box";

const ViewGrid = () => {
  const currentGrid = useCurrentGrid();
  const [grid, setGrid] = useState(currentGrid)
  const [color, setColor] = useState<[number, number, number]>([0, 0, 0])
  const [{ data: updateData, loading: updateLoading, error: updateError },
    updateGrid
  ] = useAxios<Grid>(
    {
      url: `/grids/${currentGrid.id}`,
      method: "PUT"
    },
    { manual: true }
  );

  const handleBoxClick = async (i: number, j: number) => {
    const updatedGrid = { ...grid }
    updatedGrid.boxes[i][j] = setBoxLEDsRGB(updatedGrid.boxes[i][j], { rgb: color })
    await updateGrid({ data: updatedGrid });
    setGrid(updatedGrid);
  }

  const handleColorSelect = (value: ColorSwatchType) => {
    setColor([value.rgb.red, value.rgb.green, value.rgb.blue])
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 items-center">
        <h1 className="text-lg">{grid.name}</h1>
        <Link to="edit">
          <Button>Edit</Button>
        </Link></div>
      <>
        <GridComponent grid={grid}>
          {grid.boxes.map((row, i) =>
            row.map((box, j) =>
              <NormalBox key={`${i}-${j}`} box={box} onClick={() => handleBoxClick(i, j)} />))
          }
        </GridComponent>
        <ColorPicker onClick={handleColorSelect} />
      </>
    </div>
  )
}

export default () => (
  <CurrentGridProvider>
    <ViewGrid />
  </CurrentGridProvider>
);

