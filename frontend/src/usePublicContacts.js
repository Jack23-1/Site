import { useEffect, useState } from 'react'
import { staticContentMode } from './contentMode'

const staticContact = {
  email: '', phone: '', address: { fr: '', en: '' }, hours: { fr: '', en: '' },
  facebookUrl: 'https://www.facebook.com/share/1Dmq3YbWfm/?mibextid=wwXIfr',
  xUrl: 'https://x.com/ONIP_RDC', youtubeUrl: 'https://youtube.com/@onip243?si=LI5tkGTEFnESUy6P',
}

export default function usePublicContacts() {
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (staticContentMode) return
    const controller = new AbortController()
    setLoading(true); setError(false)
    fetch('/api/contacts', { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(response => { if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Unavailable'); return response.json() })
      .then(data => setContact(data.contact))
      .catch(err => { if (err.name !== 'AbortError') setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])
  return { contact: staticContentMode ? staticContact : contact, loading: staticContentMode ? false : loading, error: staticContentMode ? false : error, reload: () => setRevision(value => value + 1) }
}
