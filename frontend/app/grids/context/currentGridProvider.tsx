import useAxios from "axios-hooks";
import { createContext, useContext } from "react";
import { useParams } from "react-router";
import type { Grid } from "~/utils/api";

const emptyGrid: Grid = {
    name: "",
    boxes: [],
}

const GridContext = createContext<Grid>({...emptyGrid});

export const CurrentGridProvider = (props: React.PropsWithChildren) => {
    const { gridId } = useParams();
    const [{data, loading, error}] = useAxios<Grid>(`/grids/${gridId}`);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error</div>
    }

    return (
        <GridContext value={{...data!}}>
            {props.children}
        </GridContext>
    )
};

export const useCurrentGrid = () => useContext(GridContext);
