import type { GridType } from "../types/bookshelfTypes"
import Box from "./box"

const Grid = (state: GridType) => {
  const { width, boxes } = state
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
      {boxes.map((box, idx) => (
        <Box key={`box-${idx}`} id={box.id} rgb={box.rgb} />
      ))}
    </div>
  )
}

export default Grid
