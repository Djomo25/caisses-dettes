import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestCode, verifyCode } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import styles from './Connexion.module.css'

type Etape = 'email' | 'code'

export function Connexion() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [etape, setEtape] = useState<Etape>('email')
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [estNouveau, setEstNouveau] = useState(false)
  const [code, setCode] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleDemanderCode(event: FormEvent) {
    event.preventDefault()
    setErreur(null)
    setChargement(true)
    try {
      await requestCode(email.trim(), estNouveau ? nom.trim() : undefined)
      setEtape('code')
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Impossible de contacter le serveur.')
    } finally {
      setChargement(false)
    }
  }

  async function handleSeConnecter(event: FormEvent) {
    event.preventDefault()
    setErreur(null)
    setChargement(true)
    try {
      const { token } = await verifyCode(email.trim(), code.trim())
      login(token)
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

        {etape === 'email' ? (
          <form onSubmit={handleDemanderCode} className={styles.formulaire}>
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

            {estNouveau && (
              <div>
                <label className="libelle" htmlFor="nom">
                  Votre nom
                </label>
                <input
                  id="nom"
                  className="champ"
                  type="text"
                  required
                  placeholder="Mama Nzuzi"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
            )}

            {erreur && <p className="erreur">{erreur}</p>}

            <button type="submit" className="bouton" disabled={chargement}>
              {chargement ? 'Envoi en cours…' : 'Recevoir mon code'}
            </button>

            <button
              type="button"
              className="bouton-lien"
              onClick={() => setEstNouveau((v) => !v)}
            >
              {estNouveau ? 'Déjà un compte ?' : 'Nouveau commerçant ?'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSeConnecter} className={styles.formulaire}>
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

            <button
              type="button"
              className="bouton-lien"
              onClick={() => {
                setEtape('email')
                setCode('')
                setErreur(null)
              }}
            >
              ← Modifier l'email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
