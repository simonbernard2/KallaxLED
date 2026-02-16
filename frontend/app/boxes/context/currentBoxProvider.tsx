import useAxios from 'axios-hooks'
import { createContext, useContext } from 'react'
import { useParams } from 'react-router'
import type { Box } from '~/utils/api'

const emptyBox: Box = {
  books: [],
  leds: [],
}

const BoxContext = createContext<Box>({ ...emptyBox })

export const CurrentBoxProvider = (props: React.PropsWithChildren) => {
  const { boxId } = useParams()
  const [{ data, loading, error }] = useAxios<Box>(`/boxes/${boxId}`)

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error</div>
  }

  return <BoxContext value={{ ...data! }}>{props.children}</BoxContext>
}

export const useCurrentGrid = () => useContext(BoxContext)
