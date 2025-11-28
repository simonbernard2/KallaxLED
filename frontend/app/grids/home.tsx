import useAxios from "axios-hooks";
import { Link } from "react-router";
import type { Grid } from "~/utils/api";

const Home = () => {
  const [{ data: grids, loading, error }] = useAxios<Grid[]>("/grids");
  if (loading || error) {
    return <div>Loading</div>
  }
  return (
    <>
      <Link to="create">
        <button className="bg-green-800 py-2 px-4 rounded cursor-pointer">Create Grid</button>
      </Link>
      {grids!.map((grid) => (
        <div key={grid.id}>
          <Link to={`${grid.id}`}>
            {grid.name}
          </Link>
        </div>
      ))}
    </>
  )
}

export default Home
