import useAxios from "axios-hooks";
import { Link } from "react-router";
import type { Grid } from "~/utils/api";
import Button from "~/utils/components/button/button";

const Home = () => {
  const [{ data: grids, loading, error }] = useAxios<Grid[]>("/grids");
  if (loading || error) {
    return <div>Loading</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-10 relative overflow-x-auto bg-neutral-primary-soft shadow-xl rounded-xl border dark:border-neutral-500 border-neutral-300 w-2xl">
        <table className="w-full text-sm text-left rtl:text-right text-body">
          <thead className="dark:bg-neutral-700 border-b border-default text-lg">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Width
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Height
              </th>
              <th scope="col" className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {grids!.map((grid) => (
              <tr key={grid.id} className="odd:bg-neutral-200 dark:odd:bg-neutral-500 even:bg-neutral-100 dark:even:bg-neutral-400 border-b last:border-none dark:hover:bg-neutral-300 dark:hover:text-gray-800 hover:bg-neutral-300 transition duration-200">
                <th scope="row" className="px-6 py-4 font-bold text-heading whitespace-nowrap underline">
                  <Link to={`${grid.id}`}>
                    {grid.name}
                  </Link>
                </th>
                <td className="px-6 py-4">
                  {grid.width}
                </td>
                <td className="px-6 py-4">
                  {grid.height}
                </td>
                <td className="px-6 py-4">
                  <Link to={`${grid.id}/edit`}>edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="create">
        <Button color="green">Create Grid</Button>
      </Link>
    </div>
  )
}

export default Home
