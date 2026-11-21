import { useCallback, useMemo, useState } from 'react'
import { API_URL } from '../api/config'
import { clearToken, getToken, setToken } from '../api/token'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'mountains-user'

function readStoredUser() {
  if (!getToken()) return null
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

async function authenticate(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
  return data
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const saveSession = useCallback((data) => {
    setToken(data.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(
    async (email, password) => saveSession(await authenticate('/auth/login', { email, password })),
    [saveSession],
  )

  const register = useCallback(
    async (name, email, password) =>
      saveSession(await authenticate('/auth/register', { name, email, password })),
    [saveSession],
  )

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])
  return <AuthContext value={value}>{children}</AuthContext>
}
