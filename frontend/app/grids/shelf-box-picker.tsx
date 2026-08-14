import GridDisplay from '~/grids/grid'
import { formatBoxLabel } from '~/grids/box-label'
import { assignableBoxes } from '~/grids/boxes'
import type { Grid } from '~/utils/api'

interface ShelfBoxPickerProps {
  grid: Grid | null
  selectedBoxId: number | null
  onSelect: (boxId: number | null) => void
  allowUnassigned?: boolean
  emptyMessage?: string
  disabled?: boolean
  missingSelectionLabel?: string | null
  ariaLabel?: string
}

const selectedButtonClasses =
  'border-[var(--forest)] bg-[var(--forest)] text-white shadow-[0_18px_40px_-24px_rgba(31,74,54,0.85)]'
const idleButtonClasses =
  'border-[var(--surface-border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-hover)]'

const ShelfBoxPicker = ({
  grid,
  selectedBoxId,
  onSelect,
  allowUnassigned = true,
  emptyMessage = 'Create a grid before assigning books to shelf boxes.',
  disabled = false,
  missingSelectionLabel = null,
  ariaLabel = 'Shelf box picker',
}: ShelfBoxPickerProps) => {
  const availableBoxes = assignableBoxes(grid)
  const hasAvailableBoxes = availableBoxes.length > 0
  const hasMissingSelection = selectedBoxId != null && !availableBoxes.some(box => box.id === selectedBoxId)

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--ink-muted)]">Pick the shelf spot that matches the physical layout.</p>

      <div role="group" aria-label={ariaLabel} className="space-y-3">
        {allowUnassigned && (
          <button
            type="button"
            aria-pressed={selectedBoxId == null}
            disabled={disabled}
            onClick={() => onSelect(null)}
            className={[
              'button-base w-full justify-start rounded-2xl border px-4 py-3 text-left ring-0',
              selectedBoxId == null ? selectedButtonClasses : idleButtonClasses,
              disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className={selectedBoxId == null ? 'text-white' : 'text-[var(--ink-muted)]'}>Unassigned</span>
          </button>
        )}

        {hasMissingSelection && missingSelectionLabel && (
          <div className="rounded-3xl border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm text-[var(--danger)]">
            Current saved box: {missingSelectionLabel}. Save changes to keep it, choose Unassigned to clear it, or pick
            a box from the current grid.
          </div>
        )}

        {hasAvailableBoxes ? (
          <GridDisplay
            grid={grid!}
            className="min-w-[18rem]"
            renderBox={box => {
              const label = formatBoxLabel(box)
              const isSelected = box.id === selectedBoxId

              return (
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={isSelected}
                  disabled={disabled || box.id == null}
                  onClick={() => onSelect(box.id ?? null)}
                  className={[
                    'flex min-h-24 w-full flex-col justify-between rounded-[26px] border p-3 text-left transition',
                    isSelected ? selectedButtonClasses : idleButtonClasses,
                    disabled || box.id == null ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className={isSelected ? 'text-xs text-white/80' : 'text-xs text-[var(--ink-muted)]'}>
                    {isSelected ? 'Selected shelf box' : 'Tap to assign this shelf box'}
                  </span>
                </button>
              )
            }}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)] p-4 text-sm text-[var(--ink-muted)]">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShelfBoxPicker
