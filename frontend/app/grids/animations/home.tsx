import useAxios from "axios-hooks";
import { Link, useParams } from "react-router";
import type { GridAnimation } from "~/grids/animations/api";
import Button from "~/utils/components/button/button";

const Home = () => {
  const { gridId } = useParams();
  const [{ data: animations, loading, error }] = useAxios<GridAnimation[]>(`/grids/${gridId}/animations`);
  const [{ loading: playLoading }, playAnimation] = useAxios({
    method: "POST"
  }, { manual: true });

  const handlePlay = (id: string) => {
    playAnimation({
      url: `/animations/${id}/play`
    });
  };

  if (loading || error) {
    return <div>Loading</div>
  }

  return (
    <div className="flex flex-col gap-4">
      {animations!.length > 0 &&
      <div className="mt-10 relative overflow-x-auto bg-neutral-primary-soft shadow-xl rounded-xl border dark:border-neutral-500 border-neutral-300 w-2xl">
        <table className="w-full text-sm text-left rtl:text-right text-body">
          <thead className="dark:bg-neutral-700 border-b border-default text-lg">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {animations!.map((animation) => (
              <tr key={animation.id} className="odd:bg-neutral-200 dark:odd:bg-neutral-500 even:bg-neutral-100 dark:even:bg-neutral-400 border-b last:border-none dark:hover:bg-neutral-300 dark:hover:text-gray-800 hover:bg-neutral-300 transition duration-200">
                <th scope="row" className="px-6 py-4 font-bold text-heading whitespace-nowrap underline">
                    {animation.name}
                </th>
                <td className="px-6 py-4">
                  <button onClick={() => handlePlay(animation.id!)}>play</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
}
      <Link to="create">
        <Button color="green">Create Animation</Button>
      </Link>
    </div>
  )
}

export default Home
