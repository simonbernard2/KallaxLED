import useAxios from "axios-hooks";
import { Link, useParams } from "react-router"
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

  if (error) return (<div>Error Loading Grid</div>)

  if (loading) return

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 items-center">
        <h1 className="text-lg">{gridData.name}</h1>
        <Link to="update">
          <button className="bg-gray-600 text-white px-2 py-1 rounded">Edit</button>
        </Link></div>
      <>
        <GridComponent grid={gridData} onClick={handleUpdateGrid} />
        <ColorPicker onClick={handleColorSelect} />
      </>
    </div>
  )
}

export default ViewGrid
