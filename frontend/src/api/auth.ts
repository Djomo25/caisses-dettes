import { apiFetch } from './client'

export function requestCode(email: string, nom?: string) {
  return apiFetch<{ success: true }>('/auth/request-code', {
    method: 'POST',
    body: nom ? { email, nom } : { email },
  })
}

export function verifyCode(email: string, code: string) {
  return apiFetch<{ token: string }>('/auth/verify-code', {
    method: 'POST',
    body: { email, code },
  })
}
