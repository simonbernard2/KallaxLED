import type { Grid as GridType } from "~/utils/api"
import Box from "./box"

interface Props {
  grid: GridType
  onClick?: () => void
}
const Grid = ({ grid, onClick }: Props) => {
  const rows = grid.boxes.length
  const columns = grid.boxes[0].length

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }}>
      {grid.boxes.map((row, i) =>
        row.map((box, j) => <Box key={`${i}-${j}`} box={box} />))
      }
    </div>
  )
}

export default Grid
