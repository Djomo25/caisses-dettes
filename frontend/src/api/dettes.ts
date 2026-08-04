import { apiFetch } from './client'
import type { Dette } from './types'

export function getDettes(token: string, statut?: 'due' | 'payee') {
  const query = statut ? `?statut=${statut}` : ''
  return apiFetch<Dette[]>(`/dettes${query}`, { token })
}
