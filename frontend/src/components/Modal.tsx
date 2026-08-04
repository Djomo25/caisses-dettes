import { useState, type FormEvent } from 'react'
import { createTransaction } from '../api/caisse'
import { createDette } from '../api/dettes'
import { ApiError } from '../api/client'
import { useToast } from '../toast/useToast'
import { formatMontant } from '../utils/format'
import styles from './Modal.module.css'

export type ModalType = 'entree' | 'sortie' | 'dette'

const TITRES: Record<ModalType, string> = {
  entree: 'Nouvelle entrée',
  sortie: 'Nouvelle sortie',
  dette: 'Nouvelle dette client',
}

interface ModalProps {
  type: ModalType | null
  token: string
  onClose: () => void
  onSaved: () => void
}

export function Modal({ type, token, onClose, onSaved }: ModalProps) {
  if (!type) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <ModalForm key={type} type={type} token={token} onClose={onClose} onSaved={onSaved} />
      </div>
    </div>
  )
}

function ModalForm({
  type,
  token,
  onClose,
  onSaved,
}: {
  type: ModalType
  token: string
  onClose: () => void
  onSaved: () => void
}) {
  const { showToast } = useToast()
  const [nomClient, setNomClient] = useState('')
  const [montant, setMontant] = useState('')
  const [libelle, setLibelle] = useState('')
  const [dateEcheance, setDateEcheance] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErreur(null)

    const montantNombre = parseInt(montant, 10)
    if (!montantNombre || montantNombre <= 0) {
      setErreur('Entrez un montant valide.')
      return
    }
    if (type === 'dette' && !nomClient.trim()) {
      setErreur('Entrez le nom du client.')
      return
    }

    setEnregistrement(true)
    try {
      if (type === 'dette') {
        await createDette(token, {
          nomClient: nomClient.trim(),
          montant: montantNombre,
          dateEcheance: dateEcheance || undefined,
        })
        showToast(`Dette enregistrée pour ${nomClient.trim()}.`)
      } else {
        await createTransaction(token, {
          type,
          montant: montantNombre,
          libelle: libelle.trim() || undefined,
        })
        showToast(
          `${type === 'entree' ? 'Entrée' : 'Sortie'} de ${formatMontant(montantNombre)} enregistrée.`,
        )
      }
      onSaved()
      onClose()
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Impossible de contacter le serveur.')
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className={styles.titre}>{TITRES[type]}</h3>

      {type === 'dette' && (
        <div className={styles.champWrap}>
          <label className="libelle" htmlFor="inputNom">
            Nom du client
          </label>
          <input
            id="inputNom"
            className="champ"
            type="text"
            autoFocus
            placeholder="ex. Grace M."
            value={nomClient}
            onChange={(e) => setNomClient(e.target.value)}
          />
        </div>
      )}

      <div className={styles.champWrap}>
        <label className="libelle" htmlFor="inputMontant">
          Montant (FC)
        </label>
        <input
          id="inputMontant"
          className="champ chiffre"
          type="number"
          inputMode="numeric"
          autoFocus={type !== 'dette'}
          placeholder="ex. 15000"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
        />
      </div>

      {type !== 'dette' && (
        <div className={styles.champWrap}>
          <label className="libelle" htmlFor="inputLibelle">
            Libellé (optionnel)
          </label>
          <input
            id="inputLibelle"
            className="champ"
            type="text"
            placeholder="ex. Tresses simples"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
          />
        </div>
      )}

      {type === 'dette' && (
        <div className={styles.champWrap}>
          <label className="libelle" htmlFor="inputEcheance">
            Échéance (optionnel)
          </label>
          <input
            id="inputEcheance"
            className="champ"
            type="date"
            value={dateEcheance}
            onChange={(e) => setDateEcheance(e.target.value)}
          />
        </div>
      )}

      {erreur && <p className="erreur">{erreur}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.annuler} onClick={onClose}>
          Annuler
        </button>
        <button type="submit" className={styles.confirmer} disabled={enregistrement}>
          {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
