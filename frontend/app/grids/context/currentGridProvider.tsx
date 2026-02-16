import useAxios from 'axios-hooks'
import { createContext, useContext } from 'react'
import type { Grid } from '~/utils/api'

const emptyGrid: Grid = {
  name: '',
  width: 0,
  height: 0,
  boxes: [],
}

const GridContext = createContext<Grid>({ ...emptyGrid })

export const CurrentGridProvider = (props: React.PropsWithChildren) => {
  const [{ data, loading, error }] = useAxios<Grid>(`/grid`)

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error</div>
  }

  return <GridContext.Provider value={{ ...data! }}>{props.children}</GridContext.Provider>
}

export const useCurrentGrid = () => useContext(GridContext)
