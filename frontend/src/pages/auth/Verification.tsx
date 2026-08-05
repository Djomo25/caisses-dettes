import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { verifyCode } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/useAuth'
import styles from './Auth.module.css'

interface VerificationState {
  email?: string
  nom?: string
}

export function Verification() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  const { email, nom } = (location.state as VerificationState | null) ?? {}

  const [code, setCode] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  if (!email) {
    return <Navigate to="/connexion" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErreur(null)
    setChargement(true)
    try {
      const { token } = await verifyCode(email!, code.trim())
      login(token, { email: email!, nom })
      navigate('/', { replace: true })
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Impossible de contacter le serveur.')
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
          <p className={styles.info}>
            Un code a été envoyé à <strong>{email}</strong>.
          </p>

          <div>
            <label className="libelle" htmlFor="code">
              Code à 6 chiffres
            </label>
            <input
              id="code"
              className={`champ chiffre ${styles.champCode}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {erreur && <p className="erreur">{erreur}</p>}

          <button type="submit" className="bouton" disabled={chargement || code.length !== 6}>
            {chargement ? 'Vérification…' : 'Se connecter'}
          </button>

          <button type="button" className="bouton-lien" onClick={() => navigate(-1)}>
            ← Modifier l'email
          </button>
        </form>
      </div>
    </div>
  )
}
