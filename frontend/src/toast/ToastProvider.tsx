import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './ToastContext'

const DUREE_MS = 2600

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMessage(null), DUREE_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast ${message ? 'show' : ''}`}>{message}</div>
    </ToastContext.Provider>
  )
}
