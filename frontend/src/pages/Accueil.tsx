import { useMemo, useState } from 'react'
import { getSolde, getTransactions } from '../api/caisse'
import { getDettes } from '../api/dettes'
import { useApiResource } from '../hooks/useApiResource'
import { useAuth } from '../auth/useAuth'
import { Modal, type ModalType } from '../components/Modal'
import { TransactionRow } from '../components/TransactionRow'
import { formatMontant } from '../utils/format'
import { todayISO } from '../utils/date'
import styles from './Accueil.module.css'

const NB_TRANSACTIONS_RECENTES = 4

export function Accueil() {
  const { token } = useAuth()
  const [modalType, setModalType] = useState<ModalType | null>(null)

  const {
    data: solde,
    loading: soldeLoading,
    error: soldeError,
    refetch: refetchSolde,
  } = useApiResource(() => getSolde(token!, 'jour'), [token])

  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useApiResource(() => getTransactions(token!), [token])

  const {
    data: dettesDue,
    loading: dettesLoading,
    error: dettesError,
    refetch: refetchDettesDue,
  } = useApiResource(() => getDettes(token!, 'due'), [token])

  const dettesEchues = useMemo(() => {
    if (!dettesDue) return []
    const aujourdhui = todayISO()
    return dettesDue.filter(
      (d) => d.dateEcheance && d.dateEcheance.slice(0, 10) <= aujourdhui,
    )
  }, [dettesDue])

  const activiteRecente = transactions?.slice(0, NB_TRANSACTIONS_RECENTES) ?? []

  function handleSaved() {
    refetchSolde()
    refetchTransactions()
    refetchDettesDue()
  }

  return (
    <>
      <section className="solde-card">
        <p className="label">Solde aujourd'hui</p>
        {soldeLoading ? (
          <div className={`squelette ${styles.soldeSquelette}`} />
        ) : soldeError ? (
          <p className={styles.erreurSombre}>{soldeError}</p>
        ) : (
          <>
            <div className="solde-amount chiffre">{formatMontant(solde!.solde)}</div>
            <div className="solde-split">
              <div className="item">
                <span className="dot in" />
                <span>{formatMontant(solde!.entrees)} entrées</span>
              </div>
              <div className="item">
                <span className="dot out" />
                <span>{formatMontant(solde!.sorties)} sorties</span>
              </div>
            </div>
          </>
        )}
      </section>

      <div className="quick-actions">
        <button
          type="button"
          className="qa-btn entree"
          onClick={() => setModalType('entree')}
        >
          <span className="ic">+</span>
          <span className="lbl">Entrée</span>
        </button>
        <button
          type="button"
          className="qa-btn sortie"
          onClick={() => setModalType('sortie')}
        >
          <span className="ic">–</span>
          <span className="lbl">Sortie</span>
        </button>
        <button
          type="button"
          className="qa-btn dette"
          onClick={() => setModalType('dette')}
        >
          <span className="ic">◍</span>
          <span className="lbl">Dette</span>
        </button>
      </div>

      {dettesEchues.length > 0 && (
        <div className="alert-box">
          <span className="bell">◍</span>
          <p>
            {dettesEchues.length}
            {dettesEchues.length > 1
              ? ' dettes arrivent à échéance'
              : ' dette arrive à échéance'}
            <small>{dettesEchues.map((d) => d.nomClient).join(', ')}</small>
          </p>
        </div>
      )}
      {dettesError && <p className="erreur">{dettesError}</p>}
      {dettesLoading && <div className={`squelette ${styles.alertSquelette}`} />}

      <section className="section">
        <div className="section-head">
          <h2>Activité récente</h2>
          <span className="count chiffre">{transactions?.length ?? 0}</span>
        </div>

        {transactionsLoading ? (
          <div className={styles.listeSquelette}>
            {Array.from({ length: NB_TRANSACTIONS_RECENTES }).map((_, i) => (
              <div key={i} className={`squelette ${styles.rowSquelette}`} />
            ))}
          </div>
        ) : transactionsError ? (
          <p className="erreur">{transactionsError}</p>
        ) : activiteRecente.length === 0 ? (
          <p className="empty-msg">Aucune transaction pour l'instant.</p>
        ) : (
          activiteRecente.map((t) => <TransactionRow key={t.id} transaction={t} />)
        )}
      </section>

      <Modal
        type={modalType}
        token={token!}
        onClose={() => setModalType(null)}
        onSaved={handleSaved}
      />
    </>
  )
}
