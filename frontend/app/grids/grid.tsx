import type { BoxProps, Grid as GridType } from "~/utils/api"
import type { ComponentType } from "react"

interface Props<T> {
  grid: GridType
  disabled?: boolean;
  BoxComponent: ComponentType<T & BoxProps>
  boxComponentProps: T
}


const Grid = <ExtraProps extends object>({ grid, disabled, BoxComponent, boxComponentProps }: Props<ExtraProps>) => {
  const rows = grid.boxes[0].length
  const disabledCSS = disabled ? "opacity-50" : ""

  return (
    <div className={`grid gap-2 ${disabledCSS}`} style={{ gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }}>
      {grid.boxes.map((row, i) =>
        row.map((box, j) =>
          <BoxComponent
            key={`${i}-${j}`}
            box={box}
            i={i}
            j={j}
            {...boxComponentProps}
          />))
      }

    </div>
  )
}

export default Grid
