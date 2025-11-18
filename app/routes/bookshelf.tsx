import { useSelector } from "react-redux"
import Grid from "~/features/bookshelf/components/grid"
import ColorPicker from "~/features/colorPicker/components/colorPicker"
import type { RootState } from "~/store"

const Bookshelf = () => {
  const { boxes, width, height } = useSelector((state: RootState) => state.bookshelf)
  return (
    <div className="flex flex-col items-center gap-4">
      <Grid width={width} height={height} boxes={boxes} />
      <ColorPicker />
    </div>
  )
}

export default Bookshelf
