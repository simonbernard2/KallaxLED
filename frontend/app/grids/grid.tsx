import type { BoxProps, Grid as GridType } from '~/utils/api'
import type { ComponentType } from 'react'

interface Props<T> {
  grid: GridType
  disabled?: boolean
  BoxComponent: ComponentType<T & BoxProps>
  boxComponentProps: T
}

const Grid = <ExtraProps extends object>({ grid, disabled, BoxComponent, boxComponentProps }: Props<ExtraProps>) => {
  const columns = grid.width || grid.boxes[0]?.length || 0
  const disabledCSS = disabled ? 'opacity-50' : ''

  if (columns === 0) {
    return <div className="text-sm text-neutral-500">No boxes yet.</div>
  }

  return (
    <div className={`grid gap-2 ${disabledCSS}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {grid.boxes.map((row, i) =>
        row.map((box, j) => <BoxComponent key={`${i}-${j}`} box={box} i={i} j={j} {...boxComponentProps} />)
      )}
    </div>
  )
}

export default Grid
