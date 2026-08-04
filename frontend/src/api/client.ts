const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data), response.status)
  }

  return data as T
}

function extractErrorMessage(data: unknown): string {
  const fallback = 'Une erreur est survenue. Réessayez.'
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return fallback
  }
  const { message } = data as { message: unknown }
  if (Array.isArray(message)) {
    return message.join(', ') || fallback
  }
  return typeof message === 'string' ? message : fallback
}
