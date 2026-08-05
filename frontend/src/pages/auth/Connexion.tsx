import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestCode } from '../../api/auth'
import { ApiError } from '../../api/client'
import styles from './Auth.module.css'

export function Connexion() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [compteInconnu, setCompteInconnu] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErreur(null)
    setCompteInconnu(false)
    setChargement(true)
    try {
      const emailTrim = email.trim()
      await requestCode(emailTrim)
      navigate('/verification', { state: { email: emailTrim } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setCompteInconnu(true)
        setErreur(err.message)
      } else {
        setErreur(err instanceof ApiError ? err.message : 'Impossible de contacter le serveur.')
      }
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={`carte ${styles.carte}`}>
        <h1 className={styles.titre}>Carnet</h1>
        <p className={styles.sousTitre}>Suivi de caisse et de dettes clients</p>

        <form onSubmit={handleSubmit} className={styles.formulaire}>
          <div>
            <label className="libelle" htmlFor="email">
              Adresse email
            </label>
            <input
              id="email"
              className="champ"
              type="email"
              required
              autoFocus
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {erreur && (
            <p className="erreur">
              {erreur}
              {compteInconnu && (
                <>
                  {' '}
                  <Link to="/inscription" className={styles.lienErreur}>
                    Créer un compte
                  </Link>
                </>
              )}
            </p>
          )}

          <button type="submit" className="bouton" disabled={chargement}>
            {chargement ? 'Envoi en cours…' : 'Recevoir mon code'}
          </button>
        </form>

        <p className={styles.piedDePage}>
          Nouveau commerçant ?{' '}
          <Link to="/inscription" className={styles.lien}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
