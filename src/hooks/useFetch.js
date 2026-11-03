import { useEffect, useState } from 'react'

export function useFetch(url) {
  const [result, setResult] = useState({ url: null, data: null, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!url) return undefined
    const controller = new AbortController()

    fetch(url, { method: 'GET', signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setResult({ url, data, error: null }))
      .catch((err) => {
        if (err.name !== 'AbortError') setResult({ url, data: null, error: err.message })
      })

    return () => controller.abort()
  }, [url, reloadKey])

  return {
    data: result.url === url ? result.data : null,
    error: result.url === url ? result.error : null,
    loading: Boolean(url) && result.url !== url,
    refetch: () => setReloadKey((key) => key + 1),
  }
}
