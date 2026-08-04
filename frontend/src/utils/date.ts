import type { Dette } from '../api/types'

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface DetteDueInfo {
  label: string
  late: boolean
}

export function getDetteDueInfo(dette: Dette): DetteDueInfo {
  if (!dette.dateEcheance) {
    return { label: "Pas d'échéance fixée", late: false }
  }

  const echeance = dette.dateEcheance.slice(0, 10)
  const aujourdhui = todayISO()
  const late = dette.statut === 'due' && echeance < aujourdhui

  if (echeance === aujourdhui) {
    return { label: "Échéance aujourd'hui", late: false }
  }
  if (late) {
    return { label: `En retard depuis le ${echeance}`, late: true }
  }
  return { label: `Échéance le ${echeance}`, late: false }
}
