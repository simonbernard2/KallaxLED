import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "~/store"
import { useEffect, useState } from "react"
import { updateGridDimensions } from "~/features/bookshelf/slices/bookshelfSlice"

const DIMENSION_RANGE = { min: 1, max: 7 }

const Bookshelf = () => {
  const { width, height } = useSelector((state: RootState) => state.bookshelf)
  const dispatch = useDispatch<AppDispatch>()
  const [gridWidth, setGridWidth] = useState(width);
  const [gridHeight, setGridHeight] = useState(height)
  const [isActive, setIsActive] = useState(false);

  const clampValue = (value: number) => (
    Math.min(Math.max(value, DIMENSION_RANGE.min), DIMENSION_RANGE.max)
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const nextWidth = clampValue(gridWidth)
    const nextHeight = clampValue(gridHeight)
    setGridHeight(nextHeight)
    setGridWidth(nextWidth)
    dispatch(updateGridDimensions({ width: nextWidth, height: nextHeight }))
    setIsActive(false)
  }

  useEffect(() => {
    if ((gridWidth == width) && (gridHeight == height)) {
      setIsActive(false)
    } else {
      setIsActive(true)
    }
  }, [gridWidth, gridHeight])

  return (
    <form onSubmit={handleSave} className="flex flex-col items-center justify-center p-md gap-4">
      <div className="grid grid-cols-2 gap-4 w-lg">
        <label htmlFor="gridWidth" className="font-medium text-white">
          Number of boxes horizontally
        </label>
        <input
          id="gridWidth"
          name="gridWidth"
          type="number"
          min={DIMENSION_RANGE.min}
          max={DIMENSION_RANGE.max}
          value={gridWidth}
          onChange={(event) => setGridWidth(Number(event.target.value))}
          className="bg-gray-800 p-1.5 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
        />
        <label htmlFor="gridHeight" className="font-medium text-white">
          Number of boxes vertically
        </label>
        <input
          id="gridHeight"
          name="gridHeight"
          type="number"
          min={DIMENSION_RANGE.min}
          max={DIMENSION_RANGE.max}
          value={gridHeight}
          onChange={(event) => setGridHeight(Number(event.target.value))}
          className="bg-gray-800 p-1.5 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
        />
      </div>
      <div>
        {isActive && <button type="submit" className="bg-slate-800 px-3 py-2 cursor-pointer">Save</button>}
      </div>
    </form>
  )
}

export default Bookshelf
