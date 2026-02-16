import useAxios from 'axios-hooks'
import { useEffect, useState } from 'react'
import { addLEDtoBox, type Color, type Grid, type LED } from '~/utils/api'
import GridComponent from '~/grids/grid'
import { CurrentGridProvider, useCurrentGrid } from './../context/currentGridProvider'
import { useNavigate } from 'react-router'
import Button from '~/utils/components/button/button'
import Box from './box'

const LEDAssign = () => {
  const currentGrid = useCurrentGrid()
  const navigate = useNavigate()
  const [ledID, setLedID] = useState(0)
  const [grid, setGrid] = useState(currentGrid)
  const [{ loading: ledLoading, error: ledError }, putLED] = useAxios<LED, Color>({
    url: '/leds/0',
    method: 'PUT',
    data: { rgb: [15, 0, 0] },
  })
  const [{}, saveAssignments] = useAxios<Grid, Record<number, number[]>>(
    { url: `/grid/leds`, method: 'PUT' },
    { manual: true }
  )

  const handleLEDUpdate = async (offset: number) => {
    const nextId = ledID + offset
    if (nextId < 0 || nextId === 150) return

    await putLED({
      url: `/leds/${nextId}`,
      data: {
        rgb: [15, 0, 0],
      },
    })
    setLedID(nextId)
  }

  const currentLED: LED = {
    id: ledID,
    rgb: [15, 0, 0],
  }

  const handleSave = async () => {
    const assignments: Record<number, number[]> = {}
    grid.boxes.forEach(row => {
      row.forEach(box => {
        if (box.id == null) return
        assignments[box.id] = box.leds
      })
    })
    await saveAssignments({ data: assignments })

    navigate('/grid')
  }

  const handleBoxClick = (i: number, j: number) => {
    if (ledLoading || ledError) return

    setGrid((g: Grid) => {
      const updatedGrid = { ...g }
      const boxes = addLEDtoBox(updatedGrid, ledID, i, j)
      updatedGrid.boxes = boxes
      return updatedGrid
    })
  }

  useEffect(() => {
    setGrid(currentGrid)
  }, [currentGrid])

  return (
    <div className="flex flex-col items-center gap-4">
      <GridComponent
        grid={grid}
        disabled={ledLoading || Boolean(ledError)}
        BoxComponent={Box}
        boxComponentProps={{ currentLED, onClick: handleBoxClick, disabled: Boolean(ledLoading || ledError) }}
      />
      <div className="flex gap-4 items-center">
        <Button onClick={() => handleLEDUpdate(-1)} disabled={ledID === 0 || ledID === 150}>
          Prev
        </Button>
        {ledID}
        <Button onClick={() => handleLEDUpdate(1)}>Next</Button>
      </div>
      {ledError && <div>Error loading LED</div>}
      <div className="flex gap-4">
        <Button onClick={handleSave} color="green">
          Save
        </Button>
      </div>
    </div>
  )
}

export default () => (
  <CurrentGridProvider>
    <LEDAssign />
  </CurrentGridProvider>
)
