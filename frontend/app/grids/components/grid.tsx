import type { Grid as GridType } from "~/utils/api"
import type { ComponentType } from "react"
import type { BoxProps } from "./box";

interface Props<ExtraProps extends object = {}> {
  grid: GridType
  disabled?: boolean;
  BoxComponent: ComponentType<BoxProps & ExtraProps>
  boxComponentProps?: ExtraProps
}


const Grid = <ExtraProps extends object = {}>({ grid, disabled, BoxComponent, boxComponentProps }: Props<ExtraProps>) => {
  const rows = grid.boxes[0].length
  const disabledCSS = disabled ? "opacity-50" : ""
  const additionalProps = (boxComponentProps ?? {}) as ExtraProps

  return (
    <div className={`grid gap-2 ${disabledCSS}`} style={{ gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }}>
      {grid.boxes.map((row, i) =>
        row.map((box, j) =>
          <BoxComponent
            key={`${i}-${j}`}
            {...({ box, i, j, ...additionalProps } as BoxProps & ExtraProps)}
          />))
      }

    </div>
  )
}

export default Grid
