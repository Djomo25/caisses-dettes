import { createContext } from 'react'

export interface Profil {
  email: string
  nom?: string
}

export interface AuthContextValue {
  token: string | null
  nom: string | null
  email: string | null
  login: (token: string, profil: Profil) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
