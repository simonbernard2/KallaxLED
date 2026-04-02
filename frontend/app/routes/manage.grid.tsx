import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import GridDisplay from '~/grids/grid'
import Button from '~/utils/components/button/button'
import Input from '~/utils/components/input/input'
import { createGrid, getGrid, updateGrid, type Grid } from '~/utils/api'

export default function ManageGrid() {
  const [grid, setGrid] = useState<Grid | null>(null)
  const [draftName, setDraftName] = useState('Main Shelf')
  const [createWidth, setCreateWidth] = useState('4')
  const [createHeight, setCreateHeight] = useState('4')
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadGridPage = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const gridResult = await getGrid()
      setGrid(gridResult)
      setDraftName(gridResult?.name ?? 'Main Shelf')
    } catch {
      setError('Grid data could not be loaded.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadGridPage()
  }, [])

  const assignedBoxes = useMemo(() => grid?.boxes.flat().filter(box => box.leds.length > 0).length ?? 0, [grid])
  const totalBoxes = useMemo(() => grid?.boxes.flat().length ?? 0, [grid])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus(null)

    try {
      const createdGrid = await createGrid({
        name: draftName,
        width: Number(createWidth),
        height: Number(createHeight),
      })
      setGrid(createdGrid)
      setDraftName(createdGrid.name)
      setStatus('Grid created.')
    } catch {
      setError('Grid creation failed.')
    }
  }

  const handleRename = async () => {
    setError(null)
    setStatus(null)

    try {
      const updatedGrid = await updateGrid({ name: draftName })
      setGrid(updatedGrid)
      setStatus('Grid updated.')
    } catch {
      setError('Grid update failed.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {!grid ? (
        <section className="panel">
          <p className="section-kicker">Create grid</p>
          <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">Define the shelf layout</h2>
          <form className="mt-5 grid gap-4 lg:grid-cols-3" onSubmit={handleCreate}>
            <Input name="grid-name" label="Name" value={draftName} onChange={event => setDraftName(event.target.value)} />
            <Input
              name="grid-width"
              label="Columns"
              type="number"
              min={1}
              max={12}
              value={createWidth}
              onChange={event => setCreateWidth(event.target.value)}
            />
            <Input
              name="grid-height"
              label="Rows"
              type="number"
              min={1}
              max={12}
              value={createHeight}
              onChange={event => setCreateHeight(event.target.value)}
            />
            <div className="lg:col-span-3">
              <Button type="submit" tone="secondary">
                Create grid
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <>
          <section className="panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-kicker">Grid</p>
                <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">{grid.name}</h2>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  {grid.width} columns × {grid.height} rows • {assignedBoxes}/{totalBoxes} boxes mapped to LEDs
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/manage/grid/leds">
                  <Button tone="secondary">Open LED setup</Button>
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Input name="rename-grid" label="Grid name" value={draftName} onChange={event => setDraftName(event.target.value)} />
              <div className="flex items-end gap-3">
                <Button tone="ghost" onClick={() => void handleRename()}>
                  Save name
                </Button>
              </div>
            </div>
          </section>

          <section className="panel">
            <p className="section-kicker">Preview</p>
            <div className="mt-4 overflow-x-auto">
              <GridDisplay
                grid={grid}
                className="min-w-[18rem]"
                renderBox={box => (
                  <div
                    className={[
                      'flex min-h-24 flex-col justify-between rounded-[26px] border p-3 text-left',
                      box.leds.length > 0
                        ? 'border-[var(--forest)]/20 bg-[var(--forest)]/8'
                        : 'border-black/8 bg-white/70',
                    ].join(' ')}
                  >
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      Box {box.x}, {box.y}
                    </span>
                    <span className="text-xs text-[var(--ink-muted)]">
                      {box.leds.length > 0 ? `${box.leds.length} LEDs assigned` : 'No LEDs assigned'}
                    </span>
                  </div>
                )}
              />
            </div>
          </section>
        </>
      )}

      {isLoading && <div className="panel text-sm text-[var(--ink-muted)]">Loading grid…</div>}
      {status && <div className="panel text-sm text-[var(--forest)]">{status}</div>}
      {error && <div className="panel text-sm text-[#7b332c]">{error}</div>}
    </div>
  )
}
