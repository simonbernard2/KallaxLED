import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { formatBoxLabel } from '~/grids/box-label'
import GridDisplay from '~/grids/grid'
import Button from '~/utils/components/button/button'
import Input from '~/utils/components/input/input'
import { getGrid, saveGridAssignments, toggleLedAssignment, updateLed, type Grid } from '~/utils/api'

const MAX_LED_ID = 149
const ACTIVE_LED_COLOR: [number, number, number] = [15, 0, 0]

export default function ManageGridLeds() {
  const navigate = useNavigate()
  const [grid, setGrid] = useState<Grid | null>(null)
  const [ledId, setLedId] = useState(0)
  const [jumpLedId, setJumpLedId] = useState('0')
  const [isBusy, setIsBusy] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totalAssigned = useMemo(() => grid?.boxes.flat().reduce((count, box) => count + box.leds.length, 0) ?? 0, [grid])

  const activateLed = async (nextId: number) => {
    if (nextId < 0 || nextId > MAX_LED_ID || nextId === ledId) return

    setIsBusy(true)
    setError(null)
    try {
      await updateLed(nextId, ACTIVE_LED_COLOR)
      setLedId(nextId)
      setJumpLedId(`${nextId}`)
    } catch {
      setError('The current LED could not be updated.')
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadPage = async () => {
      setIsBusy(true)
      setError(null)

      try {
        const gridResult = await getGrid()
        if (cancelled) return
        setGrid(gridResult)
        if (gridResult) {
          await updateLed(0, ACTIVE_LED_COLOR)
          if (!cancelled) {
            setLedId(0)
            setJumpLedId('0')
          }
        }
      } catch {
        if (!cancelled) setError('LED setup could not load.')
      } finally {
        if (!cancelled) setIsBusy(false)
      }
    }

    void loadPage()

    return () => {
      cancelled = true
    }
  }, [])

  const handleBoxToggle = async (rowIndex: number, columnIndex: number) => {
    if (!grid) return
    const nextGrid = toggleLedAssignment(grid, ledId, rowIndex, columnIndex)
    setGrid(nextGrid)

    if (ledId < MAX_LED_ID) {
      await activateLed(ledId + 1)
    }
  }

  const handleSave = async () => {
    if (!grid) return

    setIsBusy(true)
    setError(null)
    setStatus(null)

    try {
      const assignments: Record<number, number[]> = {}
      grid.boxes.flat().forEach(box => {
        if (box.id != null) assignments[box.id] = box.leds
      })
      await saveGridAssignments(assignments)
      setStatus('LED assignments saved.')
      navigate('/manage/grid')
    } catch {
      setError('LED assignments could not be saved.')
    } finally {
      setIsBusy(false)
    }
  }

  if (!grid && !isBusy) {
    return <div className="panel text-sm text-[var(--ink-muted)]">Create a grid before assigning LEDs.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="panel">
        <p className="section-kicker">LED setup</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)]">Map each LED to the right shelf box</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Current LED: #{ledId}. Tap a box to toggle the highlighted LED in that box, then step forward.
            </p>
          </div>
          <div className="rounded-3xl bg-[var(--forest-strong)] px-4 py-3 text-sm text-white">
            {totalAssigned} total LED assignments stored so far
          </div>
        </div>
      </section>

      {grid && (
        <section className="panel">
          <GridDisplay
            grid={grid}
            className="min-w-[18rem]"
            renderBox={(box, rowIndex, columnIndex) => {
              const isActive = box.leds.includes(ledId)

              return (
                <button
                  type="button"
                  className={[
                    'flex min-h-24 w-full flex-col justify-between rounded-[26px] border p-3 text-left transition',
                    isActive ? 'border-[var(--accent-strong)] bg-[var(--accent)]/20' : 'border-black/8 bg-white/70 hover:bg-white',
                  ].join(' ')}
                  disabled={isBusy}
                  onClick={() => void handleBoxToggle(rowIndex, columnIndex)}
                >
                  <span className="text-sm font-semibold text-[var(--ink)]">
                    {formatBoxLabel(box)}
                  </span>
                  <span className="text-xs text-[var(--ink-muted)]">
                    {box.leds.length > 0 ? `${box.leds.length} LEDs assigned` : 'No LEDs assigned'}
                  </span>
                </button>
              )
            }}
          />
        </section>
      )}

      <section className="panel">
        <div className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr)),auto]">
          <Button tone="ghost" onClick={() => void activateLed(ledId - 1)} disabled={ledId === 0 || isBusy}>
            Previous LED
          </Button>
          <Button tone="ghost" onClick={() => void activateLed(ledId + 1)} disabled={ledId === MAX_LED_ID || isBusy}>
            Next LED
          </Button>
          <Input
            name="jump-led"
            label="Jump to LED"
            type="number"
            min={0}
            max={MAX_LED_ID}
            value={jumpLedId}
            onChange={event => setJumpLedId(event.target.value)}
          />
          <div className="flex items-end gap-3">
            <Button tone="secondary" onClick={() => void activateLed(Number(jumpLedId))} disabled={isBusy}>
              Go
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button tone="secondary" onClick={() => void handleSave()} disabled={isBusy}>
            Save assignments
          </Button>
          <Button tone="ghost" onClick={() => navigate('/manage/grid')}>
            Back to grid
          </Button>
        </div>
      </section>

      {isBusy && <div className="panel text-sm text-[var(--ink-muted)]">Working…</div>}
      {status && <div className="panel text-sm text-[var(--forest)]">{status}</div>}
      {error && <div className="panel text-sm text-[#7b332c]">{error}</div>}
    </div>
  )
}
