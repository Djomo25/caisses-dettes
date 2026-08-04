import { apiFetch } from './client'
import type { Dette } from './types'

export function getDettes(token: string, statut?: 'due' | 'payee') {
  const query = statut ? `?statut=${statut}` : ''
  return apiFetch<Dette[]>(`/dettes${query}`, { token })
}

export interface CreateDettePayload {
  nomClient: string
  montant: number
  dateEcheance?: string
}

export function createDette(token: string, payload: CreateDettePayload) {
  return apiFetch<Dette>('/dettes', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function payerDette(token: string, id: string) {
  return apiFetch<Dette>(`/dettes/${id}/payer`, {
    method: 'PATCH',
    token,
  })
}
