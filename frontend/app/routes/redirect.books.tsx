import { Navigate } from 'react-router'

export default function RedirectBooks() {
  return <Navigate to="/manage/books" replace />
}
