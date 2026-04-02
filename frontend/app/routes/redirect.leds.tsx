import { Navigate } from 'react-router'

export default function RedirectLeds() {
  return <Navigate to="/manage/grid/leds" replace />
}
