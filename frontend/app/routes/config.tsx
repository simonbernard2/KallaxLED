import { Suspense } from "react"
import { Await, useLoaderData } from "react-router"
import BookshelfList from "~/features/config/BookshelfList"


export async function loader() {
  const res = await fetch("http://192.168.17.39:5000/grids")
  const data = await res.json()
  return data
}

const Config = () => {
  const data = useLoaderData()

  return (
    <Suspense>
      <Await resolve={data}>
        <BookshelfList list={data} />
      </Await>
    </Suspense>
  )
}

export default Config
