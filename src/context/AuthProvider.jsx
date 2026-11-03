import { useCallback, useMemo, useState } from 'react'
import { API_URL } from '../api/config'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'mountains-user'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback(async (email, password) => {
    const res = await fetch(
      `${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const [found] = await res.json()
    if (!found) throw new Error('INVALID_CREDENTIALS')

    const safeUser = { id: found.id, name: found.name, email: found.email }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
    setUser(safeUser)
    return safeUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext value={value}>{children}</AuthContext>
}
