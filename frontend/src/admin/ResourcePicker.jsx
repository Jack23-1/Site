import { useId, useState } from 'react'
import PropTypes from 'prop-types'

export default function ResourcePicker({ kind, value, onChange, request, disabled, onBusyChange, simple = false }) {
  const inputId = useId()
  const [library, setLibrary] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const isImage = kind === 'image'
  const safePreview = /^https:\/\//.test(value) || /^\/api\/media\/[a-f0-9-]{36}$/.test(value) || /^\/images\/(hero|outreach|center)\.png$/.test(value)
  const upload = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 12 * 1024 * 1024) { setError('Le fichier doit faire moins de 12 Mo.'); return }
    setWorking(true); onBusyChange(true); setError('')
    try {
      const { media } = await request('/media', { method: 'POST', file })
      onChange(media.url); setFileName(media.name); setLibrary(null)
    } catch (err) { setError(err.message) }
    finally { setWorking(false); onBusyChange(false) }
  }
  const browse = async (nextCursor = null) => {
    setWorking(true); setError('')
    try {
      const data = await request(`/media?kind=${kind}${nextCursor ? `&cursor=${nextCursor}` : ''}`)
      setLibrary(previous => nextCursor ? [...previous, ...data.items] : data.items)
      setCursor(data.nextCursor)
    } catch (err) { setError(err.message) }
    finally { setWorking(false) }
  }
  return <div className="admin-resource-picker">
    <div className="admin-resource-heading"><strong>{isImage ? 'Photo du contenu' : 'Document à publier'}</strong><span>{isImage ? 'JPEG, PNG ou WebP' : 'PDF'} · 12 Mo maximum</span></div>
    <div className="admin-upload-actions">
      <input id={inputId} className="admin-file-input" type="file" accept={isImage ? 'image/jpeg,image/png,image/webp' : 'application/pdf'} disabled={disabled || working} onChange={upload} />
      <label className="admin-upload-label" htmlFor={inputId}>{working ? 'Chargement…' : isImage ? '↑ Importer une photo' : '↑ Importer un PDF'}</label>
      <button type="button" disabled={disabled || working} onClick={() => library ? setLibrary(null) : browse()}>{library ? 'Fermer la médiathèque' : 'Choisir dans la médiathèque'}</button>
    </div>
    {error && <p className="admin-alert" role="alert">{error}</p>}
    {working && <p role="status" className="admin-resource-help">Traitement du fichier…</p>}
    {value && <div className="admin-selected-media">{isImage && safePreview ? <img src={value} alt="Aperçu de la photo sélectionnée" /> : <span className="admin-file-symbol">PDF</span>}<div><strong>{fileName || (value.startsWith('/api/media/') ? 'Fichier de la médiathèque' : 'Fichier sélectionné')}</strong><small>Le fichier sera visible avec le contenu publié.</small></div><button type="button" disabled={disabled || working} onClick={() => { onChange(''); setFileName('') }}>Retirer</button></div>}
    {library && <div className="admin-library">
      {!library.length && <p>Aucun fichier disponible. Importez votre premier fichier.</p>}
      <div className="admin-library-grid">{library.map(media => <button key={media.id} type="button" disabled={disabled || working} aria-pressed={value === media.url} onClick={() => { onChange(media.url); setFileName(media.name); setLibrary(null) }}>
        {isImage ? <img src={media.url} alt="" loading="lazy" /> : <span className="admin-file-symbol">PDF</span>}<strong>{media.name}</strong><small>{Math.ceil(media.size / 1024)} Ko</small>
      </button>)}</div>
      {cursor && <button type="button" disabled={disabled || working} onClick={() => browse(cursor)}>Afficher plus de fichiers</button>}
    </div>}
    {!simple && <label>{isImage ? 'Lien de l’image (HTTPS)' : 'Lien du document (HTTPS)'}<input type="text" inputMode="url" value={value} disabled={disabled || working} placeholder="Ou collez un lien https://…" onChange={event => { onChange(event.target.value); setFileName('') }} /></label>}
  </div>
}
ResourcePicker.propTypes = { kind: PropTypes.oneOf(['image', 'document']).isRequired, value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, request: PropTypes.func.isRequired, disabled: PropTypes.bool, simple: PropTypes.bool, onBusyChange: PropTypes.func.isRequired }
