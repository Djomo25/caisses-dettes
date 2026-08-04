import { useState } from 'react'
import { getDettes, payerDette } from '../api/dettes'
import type { Dette } from '../api/types'
import { useApiResource } from '../hooks/useApiResource'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../toast/useToast'
import { DetteCard } from '../components/DetteCard'
import { ApiError } from '../api/client'
import styles from './Dettes.module.css'

const NB_LIGNES_SQUELETTE = 3

export function Dettes() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [detteEnCoursId, setDetteEnCoursId] = useState<string | null>(null)
  const [erreurPaiement, setErreurPaiement] = useState<string | null>(null)

  const {
    data: dettesActives,
    loading: loadingActives,
    error: erreurActives,
    refetch: refetchActives,
  } = useApiResource(() => getDettes(token!, 'due'), [token])

  const {
    data: dettesPayees,
    loading: loadingPayees,
    error: erreurPayees,
    refetch: refetchPayees,
  } = useApiResource(() => getDettes(token!, 'payee'), [token])

  async function handleMarquerPayee(dette: Dette) {
    setErreurPaiement(null)
    setDetteEnCoursId(dette.id)
    try {
      await payerDette(token!, dette.id)
      showToast(`${dette.nomClient} — dette marquée comme payée.`)
      refetchActives()
      refetchPayees()
    } catch (err) {
      setErreurPaiement(
        err instanceof ApiError ? err.message : 'Impossible de contacter le serveur.',
      )
    } finally {
      setDetteEnCoursId(null)
    }
  }

  return (
    <>
      <section className="section">
        <div className="section-head">
          <h2>Dettes en cours</h2>
          <span className="count chiffre">{dettesActives?.length ?? 0}</span>
        </div>

        {erreurPaiement && <p className="erreur">{erreurPaiement}</p>}

        {loadingActives ? (
          <div className={styles.listeSquelette}>
            {Array.from({ length: NB_LIGNES_SQUELETTE }).map((_, i) => (
              <div key={i} className={`squelette ${styles.carteSquelette}`} />
            ))}
          </div>
        ) : erreurActives ? (
          <p className="erreur">{erreurActives}</p>
        ) : !dettesActives || dettesActives.length === 0 ? (
          <p className="empty-msg">Aucune dette en cours.</p>
        ) : (
          dettesActives.map((d) => (
            <DetteCard
              key={d.id}
              dette={d}
              onMarquerPayee={handleMarquerPayee}
              enCours={detteEnCoursId === d.id}
            />
          ))
        )}
      </section>

      {!loadingPayees && dettesPayees && dettesPayees.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Payées</h2>
          </div>
          {erreurPayees ? (
            <p className="erreur">{erreurPayees}</p>
          ) : (
            dettesPayees.map((d) => <DetteCard key={d.id} dette={d} />)
          )}
        </section>
      )}
    </>
  )
}
