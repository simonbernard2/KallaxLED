import type { Grid as GridType, LED } from "~/utils/api"
import type { PropsWithChildren } from "react"

interface Props {
  grid: GridType
  disabled?: boolean;
}

const Grid = ({ grid, disabled, children }: PropsWithChildren<Props>) => {
  const rows = grid.boxes[0].length
  const disabledCSS = disabled ? "opacity-50" : ""

  return (
    <div className={`grid gap-2 ${disabledCSS}`} style={{ gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }}>
      {children}
    </div>
  )
}

export default Grid
