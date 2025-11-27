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
        <button>Create Grid</button>
      </Link>
      {grids!.map((grid) => (
        <div>
          <Link to={`${grid.id}/update`}>
            {grid.name}
          </Link>
        </div>
      ))}
    </>
  )
}

export default Home
