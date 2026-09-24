import { useCallback, useEffect, useRef, useState } from 'react'
import { staticContentMode } from './contentMode'
import staticContent from './data/static-content.json'

export default function usePublishedContent(type, limit = 24, live = false) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [revision, setRevision] = useState(0)
  const inFlight = useRef(false)
  const controller = useRef(null)
  const [staticLimit, setStaticLimit] = useState(limit)

  const load = useCallback(async (nextCursor = null, silent = false) => {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    inFlight.current = true
    if (!silent) setLoading(true)
    setError(false)
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
  useEffect(() => {
    if (staticContentMode) { setStaticLimit(limit); return }
    setItems([]); setCursor(null); load(); return () => controller.current?.abort()
  }, [load, revision, limit])
  useEffect(() => {
    if (staticContentMode || !live) return
    const events = new EventSource('/api/content/events')
    const refresh = () => load(null, true)
    const onVisible = () => { if (!document.hidden) refresh() }
    events.addEventListener('content', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      events.close()
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [live, load])
  if (staticContentMode) {
    const content = staticContent[type] || []
    return { items: content.slice(0, staticLimit), loading: false, error: false,
      hasMore: staticLimit < content.length,
      reload: () => setStaticLimit(limit),
      loadMore: () => setStaticLimit(value => value + limit),
    }
  }
  return { items, loading, error, hasMore: Boolean(cursor),
    reload: () => setRevision(value => value + 1),
    loadMore: () => { if (cursor && !inFlight.current) load(cursor) },
  }
}
