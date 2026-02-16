import useAxios from 'axios-hooks'
import { useEffect, useState } from 'react'
import { addLEDtoBox, type Color, type Grid, type LED } from '~/utils/api'
import GridComponent from '~/grids/grid'
import { CurrentGridProvider, useCurrentGrid } from './../context/currentGridProvider'
import { useNavigate } from 'react-router'
import Button from '~/utils/components/button/button'
import Input from '~/utils/components/input/input'
import Box from './box'

const MAX_LED_ID = 149
const ACTIVE_LED_COLOR: [number, number, number] = [15, 0, 0]

const LEDAssign = () => {
  const currentGrid = useCurrentGrid()
  const navigate = useNavigate()
  const [ledID, setLedID] = useState(0)
  const [jumpLEDID, setJumpLEDID] = useState('0')
  const [grid, setGrid] = useState(currentGrid)
  const [{ loading: ledLoading, error: ledError }, putLED] = useAxios<LED, Color>({
    url: '/leds/0',
    method: 'PUT',
    data: { rgb: ACTIVE_LED_COLOR },
  })
  const [{}, saveAssignments] = useAxios<Grid, Record<number, number[]>>(
    { url: `/grid/leds`, method: 'PUT' },
    { manual: true }
  )

  const setCurrentLED = async (nextId: number) => {
    if (nextId < 0 || nextId > MAX_LED_ID || nextId === ledID) return

    await putLED({
      url: `/leds/${nextId}`,
      data: {
        rgb: ACTIVE_LED_COLOR,
      },
    })
    setLedID(nextId)
  }

  const handleLEDUpdate = async (offset: number) => {
    await setCurrentLED(ledID + offset)
  }

  const handleJumpToLED = async () => {
    const nextId = parseInt(jumpLEDID, 10)
    if (Number.isNaN(nextId)) return
    await setCurrentLED(nextId)
  }

  const currentLED: LED = {
    id: ledID,
    rgb: ACTIVE_LED_COLOR,
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

  const handleBoxClick = async (i: number, j: number) => {
    if (ledLoading || ledError) return

    const updatedGrid = { ...grid }
    const boxes = addLEDtoBox(updatedGrid, ledID, i, j)
    updatedGrid.boxes = boxes
    setGrid(updatedGrid)

    if (ledID < MAX_LED_ID) {
      await setCurrentLED(ledID + 1)
    }
  }

  useEffect(() => {
    setGrid(currentGrid)
  }, [currentGrid])

  useEffect(() => {
    setJumpLEDID(`${ledID}`)
  }, [ledID])

  return (
    <div className="flex flex-col items-center gap-4">
      <GridComponent
        grid={grid}
        disabled={ledLoading || Boolean(ledError)}
        BoxComponent={Box}
        boxComponentProps={{ currentLED, onClick: handleBoxClick, disabled: Boolean(ledLoading || ledError) }}
      />
      <div className="flex gap-4 items-center">
        <Button onClick={() => void handleLEDUpdate(-1)} disabled={ledID === 0 || ledLoading || Boolean(ledError)}>
          Prev
        </Button>
        {ledID}
        <Button onClick={() => void handleLEDUpdate(1)} disabled={ledID === MAX_LED_ID || ledLoading || Boolean(ledError)}>
          Next
        </Button>
      </div>
      <form
        className="flex gap-2 items-end"
        onSubmit={e => {
          e.preventDefault()
          void handleJumpToLED()
        }}
      >
        <Input
          name="jumpLedId"
          label="Go to LED"
          type="number"
          min={0}
          max={MAX_LED_ID}
          value={jumpLEDID}
          onChange={e => setJumpLEDID(e.target.value)}
        />
        <Button type="submit" disabled={ledLoading || Boolean(ledError)}>
          Go
        </Button>
      </form>
      <div className="text-sm text-neutral-500">Enter a number between 0 and {MAX_LED_ID}.</div>
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
