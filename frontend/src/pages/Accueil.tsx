import { useMemo, useState } from 'react'
import { getSolde, getTransactions } from '../api/caisse'
import { getDettes } from '../api/dettes'
import { useApiResource } from '../hooks/useApiResource'
import { useAuth } from '../auth/useAuth'
import { Modal, type ModalType } from '../components/Modal'
import { formatHeure, formatMontant, getInitiales } from '../utils/format'
import styles from './Accueil.module.css'

const NB_TRANSACTIONS_RECENTES = 4

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function Accueil() {
  const { token, nom, email, logout } = useAuth()
  const [modalType, setModalType] = useState<ModalType | null>(null)

  const {
    data: solde,
    loading: soldeLoading,
    error: soldeError,
  } = useApiResource(() => getSolde(token!, 'jour'), [token])

  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useApiResource(() => getTransactions(token!), [token])

  const {
    data: dettesDue,
    loading: dettesLoading,
    error: dettesError,
  } = useApiResource(() => getDettes(token!, 'due'), [token])

  const dettesEchues = useMemo(() => {
    if (!dettesDue) return []
    const aujourdhui = todayISO()
    return dettesDue.filter(
      (d) => d.dateEcheance && d.dateEcheance.slice(0, 10) <= aujourdhui,
    )
  }, [dettesDue])

  const activiteRecente = transactions?.slice(0, NB_TRANSACTIONS_RECENTES) ?? []
  const initiales = getInitiales(nom, email)

  return (
    <div className={styles.shell}>
      <div className={styles.binder}>
        {Array.from({ length: 6 }).map((_, i) => (
          <i key={i} className={styles.dotBinder} />
        ))}
      </div>

      <header className={styles.topbar}>
        <div>
          <div className={styles.eyebrow}>Carnet du jour</div>
          <h1 className={styles.titre}>{nom ?? email ?? 'Commerçant'}</h1>
        </div>
        <button
          type="button"
          className={styles.avatarBtn}
          onClick={logout}
          title="Se déconnecter"
        >
          <span className={styles.avatar}>{initiales}</span>
        </button>
      </header>

      <section className={styles.soldeCard}>
        <p className={styles.soldeLabel}>Solde aujourd'hui</p>
        {soldeLoading ? (
          <div className={`squelette ${styles.soldeSquelette}`} />
        ) : soldeError ? (
          <p className={styles.erreurSombre}>{soldeError}</p>
        ) : (
          <>
            <div className={`${styles.soldeAmount} chiffre`}>
              {formatMontant(solde!.solde)}
            </div>
            <div className={styles.soldeSplit}>
              <div className={styles.item}>
                <span className={`${styles.dot} ${styles.dotIn}`} />
                <span>{formatMontant(solde!.entrees)} entrées</span>
              </div>
              <div className={styles.item}>
                <span className={`${styles.dot} ${styles.dotOut}`} />
                <span>{formatMontant(solde!.sorties)} sorties</span>
              </div>
            </div>
          </>
        )}
      </section>

      <div className={styles.quickActions}>
        <button
          type="button"
          className={`${styles.qaBtn} ${styles.entree}`}
          onClick={() => setModalType('entree')}
        >
          <span className={styles.qaIc}>+</span>
          <span className={styles.qaLbl}>Entrée</span>
        </button>
        <button
          type="button"
          className={`${styles.qaBtn} ${styles.sortie}`}
          onClick={() => setModalType('sortie')}
        >
          <span className={styles.qaIc}>–</span>
          <span className={styles.qaLbl}>Sortie</span>
        </button>
        <button
          type="button"
          className={`${styles.qaBtn} ${styles.dette}`}
          onClick={() => setModalType('dette')}
        >
          <span className={styles.qaIc}>◍</span>
          <span className={styles.qaLbl}>Dette</span>
        </button>
      </div>

      {dettesEchues.length > 0 && (
        <div className={styles.alertBox}>
          <span className={styles.bell}>◍</span>
          <p className={styles.alertText}>
            {dettesEchues.length}
            {dettesEchues.length > 1
              ? ' dettes arrivent à échéance'
              : ' dette arrive à échéance'}
            <small className={styles.alertSub}>
              {dettesEchues.map((d) => d.nomClient).join(', ')}
            </small>
          </p>
        </div>
      )}
      {dettesError && <p className="erreur">{dettesError}</p>}
      {dettesLoading && <div className={`squelette ${styles.alertSquelette}`} />}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Activité récente</h2>
          <span className={`${styles.count} chiffre`}>
            {transactions?.length ?? 0}
          </span>
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
          <p className={styles.emptyMsg}>Aucune transaction pour l'instant.</p>
        ) : (
          activiteRecente.map((t) => {
            const estEntree = t.type === 'entree'
            return (
              <div key={t.id} className={styles.entryRow}>
                <div className={styles.entryLeft}>
                  <div
                    className={`${styles.entryIc} ${estEntree ? styles.in : styles.out}`}
                  >
                    {estEntree ? '+' : '–'}
                  </div>
                  <div>
                    <p className={styles.entryName}>
                      {t.libelle || (estEntree ? 'Entrée' : 'Sortie')}
                    </p>
                    <p className={styles.entryTime}>{formatHeure(t.date)}</p>
                  </div>
                </div>
                <div
                  className={`${styles.entryAmt} chiffre ${estEntree ? styles.in : styles.out}`}
                >
                  {estEntree ? '+' : '-'}
                  {formatMontant(t.montant)}
                </div>
              </div>
            )
          })
        )}
      </section>

      <Modal type={modalType} onClose={() => setModalType(null)} />
    </div>
  )
}
