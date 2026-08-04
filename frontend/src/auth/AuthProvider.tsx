import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type Profil } from './AuthContext'

const TOKEN_STORAGE_KEY = 'carnet.token'
const NOM_STORAGE_KEY = 'carnet.nom'
const EMAIL_STORAGE_KEY = 'carnet.email'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  )
  const [nom, setNom] = useState<string | null>(() => localStorage.getItem(NOM_STORAGE_KEY))
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(EMAIL_STORAGE_KEY),
  )

  const login = useCallback((newToken: string, profil: Profil) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    localStorage.setItem(EMAIL_STORAGE_KEY, profil.email)
    if (profil.nom) {
      localStorage.setItem(NOM_STORAGE_KEY, profil.nom)
    }
    setToken(newToken)
    setEmail(profil.email)
    if (profil.nom) {
      setNom(profil.nom)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(NOM_STORAGE_KEY)
    localStorage.removeItem(EMAIL_STORAGE_KEY)
    setToken(null)
    setNom(null)
    setEmail(null)
  }, [])

  const value = useMemo(
    () => ({ token, nom, email, login, logout }),
    [token, nom, email, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
