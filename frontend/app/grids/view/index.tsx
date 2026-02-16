import useAxios from "axios-hooks";
import { Link } from "react-router"
import GridComponent from "~/grids/grid";
import { useEffect, useState } from "react";
import ColorPicker from "~/utils/components/colorPicker/components/colorPicker";
import type { ColorSwatchType } from "~/utils/components/colorPicker/types/colorPickerTypes";
import { CurrentGridProvider, useCurrentGrid } from "../context/currentGridProvider";
import Button from "~/utils/components/button/button";
import Box from "./box";

const ViewGrid = () => {
  const currentGrid = useCurrentGrid();
  const [grid, setGrid] = useState(currentGrid)
  const [color, setColor] = useState<[number, number, number]>([255, 255, 255])

  const toLedTuple = (value: ColorSwatchType): [number, number, number] => {
    const rgb = value.ledRgb ?? value.rgb
    return [rgb.red, rgb.green, rgb.blue]
  }

  const [{ loading: highlightLoading, error: highlightError }, highlightBox] = useAxios(
    { url: "/lights/highlight", method: "POST" },
    { manual: true }
  )
  const [{ loading: clearLoading, error: clearError }, clearHighlight] = useAxios(
    { url: "/lights/clear", method: "POST" },
    { manual: true }
  )

  const handleBoxClick = async (i: number, j: number) => {
    if (highlightLoading || highlightError) return
    const boxId = grid.boxes[i][j].id
    if (!boxId) return
    await highlightBox({ data: { box_id: boxId, rgb: color } })
  }

  const handleColorSelect = (value: ColorSwatchType) => {
    setColor(toLedTuple(value))
  }

  useEffect(() => {
    setGrid(currentGrid)
  }, [currentGrid])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 items-center">
        <h1 className="text-lg">{grid.name}</h1>
        <Link to="/grid/edit">
          <Button>Edit</Button>
        </Link></div>
      <>
        <GridComponent grid={grid} BoxComponent={Box} boxComponentProps={{ onClick: handleBoxClick }} />
        <div className="flex items-center gap-4">
          <ColorPicker onClick={handleColorSelect} />
          <Button onClick={() => clearHighlight()} disabled={clearLoading || highlightLoading}>
            {clearLoading ? "clearing..." : "clear"}
          </Button>
        </div>
        {(highlightError || clearError) && <div>Error updating lights</div>}
      </>
    </div>
  )
}

export default () => (
  <CurrentGridProvider>
    <ViewGrid />
  </CurrentGridProvider>
);
