import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestCode } from '../../api/auth'
import { ApiError } from '../../api/client'
import styles from './Auth.module.css'

export function Inscription() {
  const navigate = useNavigate()

  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [compteExistant, setCompteExistant] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErreur(null)
    setCompteExistant(false)
    setChargement(true)
    try {
      const emailTrim = email.trim()
      const nomTrim = nom.trim()
      await requestCode(emailTrim, nomTrim)
      navigate('/verification', { state: { email: emailTrim, nom: nomTrim } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setCompteExistant(true)
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
        <p className={styles.sousTitre}>Créez votre compte commerçant</p>

        <form onSubmit={handleSubmit} className={styles.formulaire}>
          <div>
            <label className="libelle" htmlFor="nom">
              Nom du commerce
            </label>
            <input
              id="nom"
              className="champ"
              type="text"
              required
              autoFocus
              placeholder="Mama Nzuzi"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>

          <div>
            <label className="libelle" htmlFor="email">
              Adresse email
            </label>
            <input
              id="email"
              className="champ"
              type="email"
              required
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {erreur && (
            <p className="erreur">
              {erreur}
              {compteExistant && (
                <>
                  {' '}
                  <Link to="/connexion" className={styles.lienErreur}>
                    Se connecter
                  </Link>
                </>
              )}
            </p>
          )}

          <button type="submit" className="bouton" disabled={chargement}>
            {chargement ? 'Envoi en cours…' : 'Créer mon compte'}
          </button>
        </form>

        <p className={styles.piedDePage}>
          Déjà un compte ?{' '}
          <Link to="/connexion" className={styles.lien}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
