import { useSelector } from "react-redux"
import Grid from "~/features/bookshelf/components/grid"
import type { RootState } from "~/store"

const Bookshelf = () => {
  const { boxes, width } = useSelector((state: RootState) => state.bookshelf)
  return (
    <div className="flex flex-col items-center">
      <Grid width={width} boxes={boxes} />
    </div>
  )
}

export default Bookshelf
