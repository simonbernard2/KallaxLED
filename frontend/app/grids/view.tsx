import useAxios from "axios-hooks";
import { useParams } from "react-router"
import type { Grid } from "~/utils/api";
import GridComponent from "~/grids/components/grid";
import { useEffect, useState } from "react";
import { setBoxLEDsRGB } from "~/utils/api";
import ColorPicker from "~/utils/components/colorPicker/components/colorPicker";
import type { ColorSwatchType } from "~/utils/components/colorPicker/types/colorPickerTypes";

const ViewGrid = () => {
  const { gridId } = useParams();
  const [{ data: gridData, loading, error }] = useAxios(`/grids/${gridId}`);
  const [grid, setGrid] = useState(gridData)
  const [color, setColor] = useState<[number, number, number]>([0, 0, 0])
  const [{ data: updateData, loading: updateLoading, error: updateError },
    updateGrid
  ] = useAxios<Grid>(
    {
      url: `/grids/${gridId}`,
      method: "PUT"
    },
    { manual: true }
  );


  const handleUpdateGrid = async (i: number, j: number) => {
    setGrid((g: Grid) => {
      const updatedGrid = { ...g }
      updatedGrid.boxes[i][j] = setBoxLEDsRGB(updatedGrid.boxes[i][j], { rgb: color })
      return updatedGrid
    })
    await updateGrid({
      data: {
        id: grid.id,
        name: grid.name,
        boxes: grid.boxes

      }
    })
  }

  const handleColorSelect = (value: ColorSwatchType) => {
    setColor([value.rgb.red, value.rgb.green, value.rgb.blue])
  }

  useEffect(() => {
    setGrid(gridData)
  }, [gridData, handleColorSelect])

  if (loading || error) {
    return (
      <div>Loading</div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div>{gridData.name}</div>
      <>
        <GridComponent grid={gridData} onClick={handleUpdateGrid} />
        <ColorPicker onClick={handleColorSelect} />
      </>
    </div>
  )
}

export default ViewGrid
