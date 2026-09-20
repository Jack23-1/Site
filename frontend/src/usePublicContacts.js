import { useEffect, useState } from 'react'

export default function usePublicContacts() {
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(false)
    fetch('/api/contacts', { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(response => { if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Unavailable'); return response.json() })
      .then(data => setContact(data.contact))
      .catch(err => { if (err.name !== 'AbortError') setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])
  return { contact, loading, error, reload: () => setRevision(value => value + 1) }
}
