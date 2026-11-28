import { renderHook } from '@testing-library/react'
import { createContext } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from './useAuth'
import { AuthContext } from '../context/authContext'

vi.mock('../context/authContext', () => ({ AuthContext: createContext(null) }))

describe('useAuth', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns the context value inside AuthProvider', () => {
    const value = { user: { id: 1, name: 'sasha' }, login: vi.fn(), logout: vi.fn() }
    const wrapper = ({ children }) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current).toBe(value)
  })

  it('throws outside of AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside AuthProvider')
  })
})
