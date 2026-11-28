import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMutation } from './useMutation'

vi.mock('../api/token', () => ({
  authHeaders: () => ({ Authorization: 'Bearer test-token' }),
}))

function response({ ok = true, status = 200, body = {} } = {}) {
  return { ok, status, json: () => Promise.resolve(body) }
}

describe('useMutation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts idle', () => {
    const { result } = renderHook(() => useMutation())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.mutate).toBe('function')
  })

  it('sends a POST with a JSON body and auth headers, and returns the data', async () => {
    fetch.mockResolvedValue(response({ body: { id: 7 } }))
    const { result } = renderHook(() => useMutation())

    let data
    await act(async () => {
      data = await result.current.mutate('http://api/bookings', {
        body: { mountain: 'hoverla', date: '2026-12-04' },
      })
    })

    expect(data).toEqual({ id: 7 })
    expect(fetch).toHaveBeenCalledWith('http://api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ mountain: 'hoverla', date: '2026-12-04' }),
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('supports a custom method without a body', async () => {
    fetch.mockResolvedValue(response())
    const { result } = renderHook(() => useMutation())

    await act(async () => {
      await result.current.mutate('http://api/bookings/1', { method: 'DELETE' })
    })

    const options = fetch.mock.calls[0][1]
    expect(options.method).toBe('DELETE')
    expect(options.body).toBeUndefined()
  })

  it('works when called without options', async () => {
    fetch.mockResolvedValue(response())
    const { result } = renderHook(() => useMutation())

    await act(async () => {
      await result.current.mutate('http://api/ping')
    })
    expect(fetch.mock.calls[0][1].method).toBe('POST')
  })

  it('is loading while the request is in flight', async () => {
    let resolveFetch
    fetch.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)))
    const { result } = renderHook(() => useMutation())

    let promise
    act(() => {
      promise = result.current.mutate('http://api/bookings', { body: {} })
    })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveFetch(response())
      await promise
    })
    expect(result.current.loading).toBe(false)
  })

  it('returns an empty object when the response has no JSON body', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.reject(new SyntaxError('Unexpected end of JSON')),
    })
    const { result } = renderHook(() => useMutation())

    let data
    await act(async () => {
      data = await result.current.mutate('http://api/bookings/1', { method: 'DELETE' })
    })
    expect(data).toEqual({})
  })

  it('throws and stores the server message for a non-ok response', async () => {
    fetch.mockResolvedValue(
      response({ ok: false, status: 409, body: { message: 'Booking already exists' } }),
    )
    const { result } = renderHook(() => useMutation())

    await act(async () => {
      await expect(result.current.mutate('http://api/bookings', { body: {} })).rejects.toThrow(
        'Booking already exists',
      )
    })
    expect(result.current.error).toBe('Booking already exists')
    expect(result.current.loading).toBe(false)
  })

  it('falls back to the HTTP status when the server sends no message', async () => {
    fetch.mockResolvedValue(response({ ok: false, status: 500 }))
    const { result } = renderHook(() => useMutation())

    await act(async () => {
      await expect(result.current.mutate('http://api/bookings')).rejects.toThrow('HTTP 500')
    })
    expect(result.current.error).toBe('HTTP 500')
  })

  it('throws and stores the error when the network fails', async () => {
    fetch.mockRejectedValue(new Error('Network down'))
    const { result } = renderHook(() => useMutation())

    await act(async () => {
      await expect(result.current.mutate('http://api/bookings')).rejects.toThrow('Network down')
    })
    expect(result.current.error).toBe('Network down')
  })

  it('clears the previous error on the next call', async () => {
    fetch.mockResolvedValueOnce(
      response({ ok: false, status: 403, body: { message: 'Forbidden' } }),
    )
    fetch.mockResolvedValueOnce(response())
    const { result } = renderHook(() => useMutation())

    await act(async () => {
      await expect(result.current.mutate('http://api/x')).rejects.toThrow('Forbidden')
    })
    expect(result.current.error).toBe('Forbidden')

    await act(async () => {
      await result.current.mutate('http://api/x')
    })
    expect(result.current.error).toBeNull()
  })

  it('keeps a stable mutate function between renders', () => {
    const { result, rerender } = renderHook(() => useMutation())
    const first = result.current.mutate
    rerender()
    expect(result.current.mutate).toBe(first)
  })
})
