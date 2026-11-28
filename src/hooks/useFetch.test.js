import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFetch } from './useFetch'

vi.mock('../api/token', () => ({
  authHeaders: () => ({ Authorization: 'Bearer test-token' }),
}))

function okResponse(data) {
  return { ok: true, status: 200, json: () => Promise.resolve(data) }
}

describe('useFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does nothing without a url', () => {
    const { result } = renderHook(() => useFetch(null))
    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('loads data and sends a GET request with auth headers', async () => {
    fetch.mockResolvedValue(okResponse([{ id: 1 }]))
    const { result } = renderHook(() => useFetch('http://api/bookings'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 1 }])
    expect(result.current.error).toBeNull()

    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('http://api/bookings')
    expect(options.method).toBe('GET')
    expect(options.headers).toEqual({ Authorization: 'Bearer test-token' })
    expect(options.signal).toBeInstanceOf(AbortSignal)
  })

  it('sets an error for a non-ok response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({}) })
    const { result } = renderHook(() => useFetch('http://api/bookings'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('HTTP 401')
    expect(result.current.data).toBeNull()
  })

  it('sets an error when the network request fails', async () => {
    fetch.mockRejectedValue(new Error('Network down'))
    const { result } = renderHook(() => useFetch('http://api/bookings'))

    await waitFor(() => expect(result.current.error).toBe('Network down'))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('ignores AbortError', async () => {
    fetch.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    const { result } = renderHook(() => useFetch('http://api/bookings'))

    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('aborts the request on unmount', () => {
    fetch.mockReturnValue(new Promise(() => {}))
    const { unmount } = renderHook(() => useFetch('http://api/bookings'))
    const { signal } = fetch.mock.calls[0][1]

    expect(signal.aborted).toBe(false)
    unmount()
    expect(signal.aborted).toBe(true)
  })

  it('refetch sends the request again', async () => {
    fetch.mockResolvedValueOnce(okResponse(['first'])).mockResolvedValueOnce(okResponse(['second']))
    const { result } = renderHook(() => useFetch('http://api/bookings'))
    await waitFor(() => expect(result.current.data).toEqual(['first']))

    act(() => result.current.refetch())

    await waitFor(() => expect(result.current.data).toEqual(['second']))
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('does not return old data while a new url is loading', async () => {
    fetch.mockResolvedValueOnce(okResponse('A')).mockResolvedValueOnce(okResponse('B'))
    const { result, rerender } = renderHook(({ url }) => useFetch(url), {
      initialProps: { url: 'http://api/a' },
    })
    await waitFor(() => expect(result.current.data).toBe('A'))

    rerender({ url: 'http://api/b' })
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()

    await waitFor(() => expect(result.current.data).toBe('B'))
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
