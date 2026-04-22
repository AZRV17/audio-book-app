import { createContext, useState, useCallback } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const login = useCallback(async (credentials) => {
    const { data } = await apiLogin(credentials)
    const user = { id: data.id, email: data.email, role: data.role }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(data.token)
    setUser(user)
    return data
  }, [])

  const register = useCallback(async (credentials) => {
    const { data } = await apiRegister(credentials)
    const user = { id: data.id, email: data.email, role: data.role }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(data.token)
    setUser(user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
