import { useAuth } from '../auth/useAuth'
import styles from './Accueil.module.css'

export function Accueil() {
  const { logout } = useAuth()

  return (
    <div className={styles.page}>
      <header className={styles.entete}>
        <h1>Carnet</h1>
        <button type="button" className="bouton-lien" onClick={logout}>
          Se déconnecter
        </button>
      </header>

      <div className={`carte ${styles.carte}`}>
        <p>Bienvenue. Le tableau de bord (caisse et dettes) arrive ici.</p>
      </div>
    </div>
  )
}
