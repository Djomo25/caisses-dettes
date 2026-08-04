import type { Transaction } from '../api/types'
import { formatHeure, formatMontant } from '../utils/format'

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const estEntree = transaction.type === 'entree'

  return (
    <div className="entry-row">
      <div className="entry-left">
        <div className={`entry-ic ${estEntree ? 'in' : 'out'}`}>{estEntree ? '+' : '–'}</div>
        <div>
          <p className="entry-name">
            {transaction.libelle || (estEntree ? 'Entrée' : 'Sortie')}
          </p>
          <p className="entry-time">{formatHeure(transaction.date)}</p>
        </div>
      </div>
      <div className={`entry-amt chiffre ${estEntree ? 'in' : 'out'}`}>
        {estEntree ? '+' : '-'}
        {formatMontant(transaction.montant)}
      </div>
    </div>
  )
}
