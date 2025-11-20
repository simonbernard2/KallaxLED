import Grid from "~/features/bookshelf/components/grid"
import ColorPicker from "~/features/colorPicker/components/colorPicker"
import { Suspense } from "react"
import { useLoaderData, Await } from "react-router"

export async function loader() {
  const res = await fetch("http://192.168.17.39:5000/status")
  const data = await res.json()
  return data
}


const Bookshelf = () => {
  const data = useLoaderData()
  const { width, height, boxes } = data
  return (
    <Suspense>
      <Await resolve={data}>
        <div className="flex flex-col items-center gap-4">
          <Grid width={width} height={height} boxes={boxes} />
          <ColorPicker />
        </div>
      </Await>
    </Suspense>
  )
}

export default Bookshelf
