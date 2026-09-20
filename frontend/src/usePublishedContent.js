import { useCallback, useEffect, useRef, useState } from 'react'

export default function usePublishedContent(type, limit = 24) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [revision, setRevision] = useState(0)
  const inFlight = useRef(false)
  const controller = useRef(null)

  const load = useCallback(async (nextCursor = null) => {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    inFlight.current = true
    setLoading(true); setError(false)
    try {
      const query = new URLSearchParams({ type, limit: String(limit), ...(nextCursor ? { cursor: nextCursor } : {}) })
      const response = await fetch(`/api/content?${query}`, { signal: current.signal, headers: { Accept: 'application/json' } })
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Unavailable')
      const data = await response.json()
      if (!Array.isArray(data.items)) throw new Error('Invalid response')
      if (!current.signal.aborted) {
        setItems(previous => nextCursor ? [...previous, ...data.items.filter(item => !previous.some(existing => existing.id === item.id))] : data.items)
        setCursor(data.nextCursor)
      }
    } catch (err) { if (err.name !== 'AbortError') setError(true) }
    finally { if (!current.signal.aborted) { setLoading(false); inFlight.current = false } }
  }, [type, limit])
  useEffect(() => { setItems([]); setCursor(null); load(); return () => controller.current?.abort() }, [load, revision])
  return { items, loading, error, hasMore: Boolean(cursor),
    reload: () => setRevision(value => value + 1),
    loadMore: () => { if (cursor && !inFlight.current) load(cursor) },
  }
}
