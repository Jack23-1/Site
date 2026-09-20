// The server must authenticate every admin route using an HttpOnly session cookie.
export async function adminRequest(path, { method = 'GET', body, csrfToken, signal, file } = {}) {
  const response = await fetch(`/api/admin${path}`, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(file ? { 'Content-Type': file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'), 'X-File-Name': encodeURIComponent(file.name) } : body ? { 'Content-Type': 'application/json' } : {}),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
    body: file || (body ? JSON.stringify(body) : undefined),
    signal,
  })
  const json = response.headers.get('content-type')?.includes('application/json')
    ? await response.json() : null
  if (!response.ok || !json) {
    const error = new Error(response.status === 401 ? 'Votre session a expiré. Reconnectez-vous.'
      : response.status === 429 ? 'Trop de tentatives. Réessayez dans quelques minutes.'
        : json?.message || 'Le serveur d’administration est indisponible.')
    error.status = response.status
    throw error
  }
  return json
}
