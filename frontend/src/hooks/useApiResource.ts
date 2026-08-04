/* eslint-disable react-hooks/exhaustive-deps -- deps est fourni par l'appelant, qui contrôle quand refetch */
import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { ApiError } from '../api/client'

interface ApiResourceState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApiResource<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
): ApiResourceState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiResourceState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof ApiError ? err.message : 'Impossible de charger les données.'
        setState({ data: null, loading: false, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), deps)

  return { ...state, refetch: load }
}
