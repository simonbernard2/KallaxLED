import useAxios from "axios-hooks";
import { Navigate, useParams } from "react-router"
import type { Grid } from "~/utils/api";
import GridComponent from "~/grids/components/grid";

const UpdateGrid = () => {
  const { gridId } = useParams();
  const [{ data, loading, error }] = useAxios(`/grids/${gridId}`);
  const [{ data: deleteData, loading: deleteLoading, error: deleteError },
    deleteGrid
  ] = useAxios<Grid>(
    {
      url: `/grids/${gridId}`,
      method: "DELETE"
    },
    { manual: true }
  );

  const handleDelete = () => {
    deleteGrid({
      data: {
        id: gridId,
      }
    })
  }

  if (loading || error || deleteLoading || deleteError) {
    return (
      <div>Loading</div>
    )
  }
  if (deleteData) {
    return <Navigate to="/grids" />
  }
  return (
    <div className="flex flex-col items-center">
      <div>{data.name}</div>
      <GridComponent grid={data} />
      <button onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded cursor-pointer">delete grid</button>
    </div>

  )
}

export default UpdateGrid
