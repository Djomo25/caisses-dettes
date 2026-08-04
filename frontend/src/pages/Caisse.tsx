import { getTransactions } from '../api/caisse'
import { useApiResource } from '../hooks/useApiResource'
import { useAuth } from '../auth/useAuth'
import { TransactionRow } from '../components/TransactionRow'
import styles from './Caisse.module.css'

const NB_LIGNES_SQUELETTE = 6

export function Caisse() {
  const { token } = useAuth()

  const {
    data: transactions,
    loading,
    error,
  } = useApiResource(() => getTransactions(token!), [token])

  return (
    <section className="section">
      <div className="section-head">
        <h2>Toutes les transactions</h2>
        <span className="count chiffre">{transactions?.length ?? 0}</span>
      </div>

      {loading ? (
        <div className={styles.listeSquelette}>
          {Array.from({ length: NB_LIGNES_SQUELETTE }).map((_, i) => (
            <div key={i} className={`squelette ${styles.rowSquelette}`} />
          ))}
        </div>
      ) : error ? (
        <p className="erreur">{error}</p>
      ) : !transactions || transactions.length === 0 ? (
        <p className="empty-msg">Aucune transaction pour l'instant.</p>
      ) : (
        transactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
      )}
    </section>
  )
}
