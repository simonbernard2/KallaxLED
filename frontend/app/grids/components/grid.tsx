import type { Grid as GridType } from "~/utils/api"
import Box from "./box"

interface Props {
  grid: GridType
  onClick?: (i: number, j: number) => void
  disabled?: boolean;
}

const Grid = ({ grid, onClick, disabled }: Props) => {
  const rows = grid.boxes[0].length
  const handleClick = (i: number, j: number) => {
    if (!onClick || disabled) return;

    return () => onClick(i, j)
  }
  const disabledCSS = disabled ? "opacity-50" : ""

  return (
    <div className={`grid gap-2 ${disabledCSS}`} style={{ gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }}>
      {grid.boxes.map((row, i) =>
        row.map((box, j) => <Box key={`${i}-${j}`} box={box} onClick={handleClick(i, j)} />))
      }
    </div>
  )
}

export default Grid
