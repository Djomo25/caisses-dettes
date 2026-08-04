import type { Dette } from '../api/types'
import { getDetteDueInfo } from '../utils/date'
import { formatMontant } from '../utils/format'

interface DetteCardProps {
  dette: Dette
  onMarquerPayee?: (dette: Dette) => void
  enCours?: boolean
}

export function DetteCard({ dette, onMarquerPayee, enCours }: DetteCardProps) {
  const { label, late } = getDetteDueInfo(dette)
  const payee = dette.statut === 'payee'

  return (
    <div className="dette-card">
      <div className="dette-top">
        <div>
          <p className="dette-name">{dette.nomClient}</p>
          <p className={`dette-due${late ? ' late' : ''}`}>{label}</p>
        </div>
        <div className="dette-amt chiffre">{formatMontant(dette.montant)}</div>
      </div>
      <div className="dette-actions">
        {payee ? (
          <button type="button" className="btn-pay paid" disabled>
            ✓ Payée
          </button>
        ) : (
          <button
            type="button"
            className="btn-pay"
            disabled={enCours}
            onClick={() => onMarquerPayee?.(dette)}
          >
            {enCours ? 'Enregistrement…' : 'Marquer payée'}
          </button>
        )}
      </div>
    </div>
  )
}
