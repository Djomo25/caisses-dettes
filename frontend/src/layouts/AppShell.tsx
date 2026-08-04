import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Tabbar } from '../components/Tabbar'
import { getInitiales } from '../utils/format'

export function AppShell() {
  const { nom, email, logout } = useAuth()
  const initiales = getInitiales(nom, email)

  return (
    <div className="shell">
      <div className="binder">
        {Array.from({ length: 6 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>

      <header className="topbar">
        <div>
          <div className="eyebrow">Carnet du jour</div>
          <h1>{nom ?? email ?? 'Commerçant'}</h1>
        </div>
        <button type="button" className="avatar-btn" onClick={logout} title="Se déconnecter">
          <span className="avatar">{initiales}</span>
        </button>
      </header>

      <Outlet />

      <Tabbar />
    </div>
  )
}
