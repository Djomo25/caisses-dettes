import { NavLink } from 'react-router-dom'

const ONGLETS = [
  { to: '/', label: 'Accueil', icone: '⌂' },
  { to: '/caisse', label: 'Caisse', icone: '▤' },
  { to: '/dettes', label: 'Dettes', icone: '◍' },
] as const

export function Tabbar() {
  return (
    <nav className="tabbar">
      {ONGLETS.map((onglet) => (
        <NavLink
          key={onglet.to}
          to={onglet.to}
          end={onglet.to === '/'}
          className={({ isActive }) => `tab-btn${isActive ? ' active' : ''}`}
        >
          <span className="ic">{onglet.icone}</span>
          <span>{onglet.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
