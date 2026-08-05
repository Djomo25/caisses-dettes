import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function GuestRoute() {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
