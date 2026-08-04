import { apiFetch } from './client'
import type { SoldeJour, Transaction } from './types'

export function getSolde(token: string, periode: 'jour' | 'semaine' = 'jour') {
  return apiFetch<SoldeJour>(`/caisse/solde?periode=${periode}`, { token })
}

export function getTransactions(token: string, date?: string) {
  const query = date ? `?date=${date}` : ''
  return apiFetch<Transaction[]>(`/caisse/transactions${query}`, { token })
}
