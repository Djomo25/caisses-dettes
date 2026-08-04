import type { ReactNode } from 'react'
import styles from './Modal.module.css'

export type ModalType = 'entree' | 'sortie' | 'dette'

const TITRES: Record<ModalType, string> = {
  entree: 'Nouvelle entrée',
  sortie: 'Nouvelle sortie',
  dette: 'Nouvelle dette client',
}

interface ModalProps {
  type: ModalType | null
  onClose: () => void
  children?: ReactNode
}

export function Modal({ type, onClose, children }: ModalProps) {
  if (!type) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.titre}>{TITRES[type]}</h3>
        {children ?? <p className={styles.placeholder}>Formulaire à venir.</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.annuler} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
