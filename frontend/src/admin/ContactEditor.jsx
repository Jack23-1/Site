import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

export default function ContactEditor({ request, onBusyChange }) {
  const [contact, setContact] = useState(null)
  const [locale, setLocale] = useState('fr')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = useCallback(async () => {
    setError('')
    try { const data = await request('/contacts'); setContact(data.contact) }
    catch (err) { setError(err.message) }
  }, [request])
  useEffect(() => { load() }, [load])
  const save = async event => {
    event.preventDefault(); setBusy(true); onBusyChange(true); setError(''); setNotice('')
    try { const data = await request('/contacts', { method: 'PUT', body: contact }); setContact(data.contact); setNotice('Les coordonnées du site ont été mises à jour.') }
    catch (err) { setError(err.message) }
    finally { setBusy(false); onBusyChange(false) }
  }
  const update = (field, value) => setContact(previous => ({ ...previous, [field]: value }))
  return <section className="admin-contact-editor">
    {error && <div className="admin-alert" role="alert">{error}<button type="button" disabled={busy} onClick={load}>Recharger les coordonnées</button></div>}
    {notice && <p className="admin-success" role="status">{notice}</p>}
    {!contact ? !error && <p role="status">Chargement des coordonnées…</p> : <form className="admin-editor" onSubmit={save}>
      <div className="admin-editor-heading"><div><span className="admin-eyebrow">INFORMATIONS PUBLIQUES</span><h2>Coordonnées de l’ONIP</h2><p>Ces informations apparaissent sur la page Contacts et dans le pied de page.</p></div></div>
      <fieldset disabled={busy}>
        <div className="admin-contact-fields"><label>Adresse e-mail publique<input type="email" value={contact.email} maxLength={254} placeholder="contact@…" onChange={event => update('email', event.target.value)} /></label><label>Téléphone public<input type="tel" value={contact.phone} maxLength={40} placeholder="+243…" onChange={event => update('phone', event.target.value)} /></label></div>
        <div className="admin-language" role="group" aria-label="Langue des coordonnées">{['fr', 'en'].map(code => <button type="button" key={code} aria-pressed={locale === code} onClick={() => setLocale(code)}>{code === 'fr' ? 'Français' : 'English'}</button>)}</div>
        <label>Adresse · {locale.toUpperCase()}<textarea rows={3} maxLength={1000} value={contact.address[locale]} onChange={event => update('address', { ...contact.address, [locale]: event.target.value })} /></label>
        <label>Horaires · {locale.toUpperCase()}<input maxLength={500} value={contact.hours[locale]} onChange={event => update('hours', { ...contact.hours, [locale]: event.target.value })} /></label>
        <div className="admin-contact-socials"><h3>Réseaux sociaux</h3><p>Laissez un champ vide pour ne pas afficher le lien correspondant.</p>
          <label>Facebook<input type="url" pattern="https://.*" value={contact.facebookUrl} onChange={event => update('facebookUrl', event.target.value)} /></label>
          <label>X (Twitter)<input type="url" pattern="https://.*" value={contact.xUrl} onChange={event => update('xUrl', event.target.value)} /></label>
          <label>YouTube<input type="url" pattern="https://.*" value={contact.youtubeUrl} onChange={event => update('youtubeUrl', event.target.value)} /></label>
        </div>
      </fieldset>
      <div className="admin-editor-actions"><button className="admin-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer les coordonnées'}</button></div>
    </form>}
  </section>
}
ContactEditor.propTypes = { request: PropTypes.func.isRequired, onBusyChange: PropTypes.func.isRequired }
