import { formatBoxLabel } from '~/grids/box-label'
import type { Box, Grid } from '~/utils/api'

interface GridDisplayProps {
  grid: Grid
  renderBox?: (box: Box, rowIndex: number, columnIndex: number) => React.ReactNode
  className?: string
}

const GridDisplay = ({ grid, renderBox, className = '' }: GridDisplayProps) => {
  const columns = grid.width || grid.boxes[0]?.length || 0

  if (columns === 0) {
    return <div className="rounded-3xl border border-dashed border-black/10 bg-white/60 p-4 text-sm text-[var(--ink-muted)]">No boxes yet.</div>
  }

  return (
    <div
      className={['grid gap-3', className].join(' ').trim()}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {grid.boxes.map((row, rowIndex) =>
        row.map((box, columnIndex) =>
          renderBox ? (
            <div key={`${rowIndex}-${columnIndex}`}>{renderBox(box, rowIndex, columnIndex)}</div>
          ) : (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className="rounded-3xl border border-black/8 bg-white/75 p-3 text-center text-xs font-semibold text-[var(--ink-muted)]"
            >
              {formatBoxLabel(box)}
            </div>
          )
        )
      )}
    </div>
  )
}

export default GridDisplay
