import useAxios from "axios-hooks"
import BookshelfList from "~/features/config/BookshelfList"
import CreateGrid from "~/grids/create"


const Config = () => {
  const [
    { data: grids, loading, error }
  ] = useAxios("/grids");

  return (
    <>
      <CreateGrid />
      {grids && <BookshelfList list={grids} />}
    </>
  )
}

export default Config
