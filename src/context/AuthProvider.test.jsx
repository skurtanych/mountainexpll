import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '../api/config'
import { useAuth } from '../hooks/useAuth'
import AuthProvider from './AuthProvider'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
const sessionUser = { id: 1, name: 'Hiker', email: 'hiker@example.com' }

function reply(body, status = 200) {
  return { ok: status < 400, status, json: async () => body }
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => vi.unstubAllGlobals())

  it('starts without a user when there is no token', () => {
    localStorage.setItem('mountains-user', JSON.stringify(sessionUser))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
  })

  it('restores the user from localStorage when a token exists', () => {
    localStorage.setItem('mountains-token', 'tok')
    localStorage.setItem('mountains-user', JSON.stringify(sessionUser))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual(sessionUser)
  })

  it('ignores a broken stored user', () => {
    localStorage.setItem('mountains-token', 'tok')
    localStorage.setItem('mountains-user', '{not json')
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
  })

  it('logs in, saves the session and returns the user', async () => {
    fetch.mockResolvedValue(reply({ token: 'new-token', user: sessionUser }))
    const { result } = renderHook(() => useAuth(), { wrapper })

    let returned
    await act(async () => {
      returned = await result.current.login('hiker@example.com', 'secret')
    })

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hiker@example.com', password: 'secret' }),
    })
    expect(returned).toEqual(sessionUser)
    expect(result.current.user).toEqual(sessionUser)
    expect(localStorage.getItem('mountains-token')).toBe('new-token')
    expect(JSON.parse(localStorage.getItem('mountains-user'))).toEqual(sessionUser)
  })

  it('does not log in and throws the server message on a wrong password', async () => {
    fetch.mockResolvedValue(reply({ message: 'Invalid email or password' }, 401))
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(result.current.login('a@b.c', 'bad')).rejects.toThrow(
        'Invalid email or password',
      )
    })
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('mountains-token')).toBeNull()
  })

  it('falls back to the HTTP status when the response has no JSON message', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.reject(new SyntaxError('no json')),
    })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(result.current.login('a@b.c', 'x')).rejects.toThrow('HTTP 503')
    })
  })

  it('registers a new user and saves the session', async () => {
    fetch.mockResolvedValue(reply({ token: 'reg-token', user: sessionUser }, 201))
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.register('Hiker', 'hiker@example.com', 'secret123')
    })

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/register`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Hiker', email: 'hiker@example.com', password: 'secret123' }),
      }),
    )
    expect(result.current.user).toEqual(sessionUser)
    expect(localStorage.getItem('mountains-token')).toBe('reg-token')
  })

  it('logs out and clears the stored session', () => {
    localStorage.setItem('mountains-token', 'tok')
    localStorage.setItem('mountains-user', JSON.stringify(sessionUser))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual(sessionUser)

    act(() => result.current.logout())

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('mountains-token')).toBeNull()
    expect(localStorage.getItem('mountains-user')).toBeNull()
  })
})
