import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import client from '../api/client'
import type { User } from '../api/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  can: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('pdmbms_user')
    return stored ? (JSON.parse(stored) as User) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pdmbms_token')
    if (!token) {
      setLoading(false)
      return
    }

    client
      .get('/me')
      .then((res) => {
        setUser(res.data.user)
        localStorage.setItem('pdmbms_user', JSON.stringify(res.data.user))
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await client.post('/login', { email, password, device_name: 'web' })
    localStorage.setItem('pdmbms_token', res.data.token)
    localStorage.setItem('pdmbms_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }

  async function logout() {
    try {
      await client.post('/logout')
    } finally {
      localStorage.removeItem('pdmbms_token')
      localStorage.removeItem('pdmbms_user')
      setUser(null)
    }
  }

  function can(permission: string) {
    return user?.permissions.includes(permission) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
