import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authHeaders, clearToken, getToken, setToken } from './token'

describe('token', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('returns null when there is no token', () => {
    expect(getToken()).toBeNull()
  })

  it('saves and reads the token', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
    expect(localStorage.getItem('mountains-token')).toBe('abc')
  })

  it('clears the token', () => {
    setToken('abc')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('returns null when localStorage is not available', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(getToken()).toBeNull()
  })

  it('builds the Authorization header only when a token exists', () => {
    expect(authHeaders()).toEqual({})
    setToken('abc')
    expect(authHeaders()).toEqual({ Authorization: 'Bearer abc' })
  })
})
