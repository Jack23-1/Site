import ResourcePicker from './ResourcePicker'
import ContactEditor from './ContactEditor'
import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { adminRequest } from './api'
import logo from '../assets/logoonip.png'
import './Admin.css'

const sections = { news: 'Actualités', documents: 'Documents', gallery: 'Galerie', carousel: 'Carrousel', contacts: 'Contacts' }
const emptyContent = type => ({ type, status: 'draft', title: { fr: '', en: '' }, body: { fr: '', en: '' }, resourceUrl: '', position: 1 })

function AdminIcon({ name }) {
  const paths = {
    carousel: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 4 3-4 3M1 9v6m22-6v6" /></>,
    contacts: <><path d="M4 4h5l2 5-3 2a15 15 0 0 0 5 5l2-3 5 2v5C10 22 2 14 4 4Z" /></>,
    news: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 8h5v5H7zM16 8h1m-1 4h1M7 16h10" /></>,
    documents: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8m-8 4h5" /></>,
    gallery: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 16 5-5 4 4 3-3 6 6" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    arrowLeft: <path d="M20 12H4m6-6-6 6 6 6" />,
    chevron: <path d="m10 7 5 5-5 5" />,
    external: <path d="M14 3h7v7m-1-6L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />,
    logout: <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m5-13 5 5-5 5m-6-5h11" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" /><path d="m8 12 3 3 5-6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    edit: <><path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15z" /><path d="M13 20h8" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M10 5a12 12 0 0 1 12 7 15 15 0 0 1-3 4M6 6a16 16 0 0 0-4 6s3 7 10 7a12 12 0 0 0 5-1" /></>,
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
AdminIcon.propTypes = { name: PropTypes.string.isRequired }

export default function Admin() {
  const [showPassword, setShowPassword] = useState(false)
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [section, setSection] = useState('news')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [editor, setEditor] = useState(null)
  const [locale, setLocale] = useState('fr')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const checkSession = useCallback(async () => {
    setChecking(true)
    setError('')
    try { setSession(await adminRequest('/session')) }
    catch (err) { if (err.status !== 401) setError(err.message) }
    finally { setChecking(false) }
  }, [])
  useEffect(() => { checkSession() }, [checkSession])

  const request = useCallback(async (path, options) => {
    try { return await adminRequest(path, { ...options, csrfToken: session?.csrfToken }) }
    catch (err) {
      if (err.status === 401) { setSession(null); setItems([]); setEditor(null) }
      throw err
    }
  }, [session?.csrfToken])

  useEffect(() => {
    if (!session?.user || section === 'contacts') return
    const controller = new AbortController()
    setLoading(true)
    setItems([])
    request(`/content?type=${section}`, { signal: controller.signal })
      .then(data => setItems(data.items))
      .catch(err => { if (err.name !== 'AbortError') setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [section, session?.user, request])

  const login = async event => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try {
      setSession(await adminRequest('/login', { method: 'POST', body: { email: fields.get('email'), password: fields.get('password') } }))
    } catch (err) { setError(err.status === 401 ? 'Adresse e-mail ou mot de passe incorrect.' : err.message) }
    finally { setBusy(false) }
  }

  const save = async event => {
    event.preventDefault()
    if (editor.type !== 'news' && !editor.resourceUrl) { setError('Choisissez un fichier pour ce contenu.'); return }
    let content = editor
    if (editor.type === 'carousel') {
      const text = (editor.carouselText ?? [editor.title.fr, editor.body.fr].filter(Boolean).join('\n')).trim()
      if (!text) { setError('Ajoutez le texte qui accompagne la photo.'); return }
      const heading = text.split('\n')[0].slice(0, 180)
      const description = text.slice(heading.length).trim()
      content = { ...editor, status: 'published', title: { fr: heading, en: heading }, body: { fr: description, en: description } }
    }
    if (!content.title.fr.trim() || !content.title.en.trim()) { setError('Renseignez le titre en français et en anglais.'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const { item } = await request(editor.id ? `/content/${editor.id}` : '/content', { method: editor.id ? 'PUT' : 'POST', body: content })
      setItems(previous => { const next = [item, ...previous.filter(entry => entry.id !== item.id)]; return item.type === 'carousel' ? next.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id)) : next })
      setEditor(null)
      setNotice(item.status === 'published' ? 'Le contenu a été publié.' : 'Le brouillon a été enregistré.')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  const remove = async () => {
    if (!window.confirm('Supprimer définitivement ce contenu ?')) return
    setBusy(true); setError('')
    try {
      await request(`/content/${editor.id}`, { method: 'DELETE', body: { version: editor.version } })
      setItems(previous => previous.filter(item => item.id !== editor.id))
      setEditor(null); setNotice('Le contenu a été supprimé.')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  const changeSection = next => { setSection(next); setEditor(null); setQuery(''); setFilter('all'); setNotice(''); setError('') }
  const updateText = (field, value) => setEditor(previous => ({ ...previous, [field]: { ...previous[field], [locale]: value } }))
  const visible = items.filter(item => (filter === 'all' || item.status === filter) && `${item.title.fr} ${item.title.en}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))

  if (checking) return <main className="admin-root admin-loading"><img src={logo} alt="ONIP" /><span className="admin-loading-line" /><p role="status">Connexion à l’administration…</p></main>
  if (!session?.user) return <main className="admin-root admin-login">
    <section className="admin-login-story" aria-label="Office National d’Identification de la Population">
      <a href="/" className="admin-login-logo"><img src={logo} alt="ONIP — Accueil" /></a>
      <div className="admin-story-copy"><span className="admin-story-label"><i /> AU SERVICE DE L’IDENTITÉ</span><h2>Une identité.<br />{' '}Un avenir <em>commun.</em></h2><p>Un espace pour informer, partager et rapprocher l’ONIP de chaque citoyen.</p><div className="admin-story-rule"><i /><i /><i /></div></div>
      <div className="admin-story-footer"><span>République Démocratique du Congo</span><span>ONIP © {new Date().getFullYear()}</span></div>
    </section>
    <section className="admin-login-panel">
      <a className="admin-login-back" href="/"><AdminIcon name="arrowLeft" /> Retour au site</a>
      <div className="admin-login-card">
        <span className="admin-login-symbol"><AdminIcon name="shield" /></span>
        <span className="admin-eyebrow">ESPACE ADMINISTRATION</span>
        <h1>Bienvenue<span>.</span></h1><p>Connectez-vous à votre espace de publication.</p>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        <form onSubmit={login}>
          <label htmlFor="admin-email">Adresse e-mail</label><div className="admin-input-icon"><AdminIcon name="mail" /><input id="admin-email" name="email" type="email" placeholder="nom@onip.gouv.cd" autoComplete="username" required disabled={busy} /></div>
          <label htmlFor="admin-password">Mot de passe</label><div className="admin-input-icon"><AdminIcon name="lock" /><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Votre mot de passe" autoComplete="current-password" required disabled={busy} /><button type="button" className="admin-password-toggle" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}><AdminIcon name={showPassword ? 'eyeOff' : 'eye'} /></button></div>
          <button className="admin-primary admin-login-submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}<AdminIcon name="arrow" /></button>
        </form>
        {error && <button className="admin-link" onClick={checkSession}>Réessayer la connexion au serveur</button>}
        <p className="admin-login-security"><AdminIcon name="shield" /> Accès réservé aux administrateurs autorisés.</p>
      </div>
      <div className="admin-login-bottom"><span>Office National d’Identification de la Population</span><span>Portail d’administration</span></div>
    </section>
  </main>

  return <div className="admin-root admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><span className="admin-brand-mark"><img src={logo} alt="ONIP" /></span><span>Portail de gestion<small>Administration du site</small></span></a>
      <div className="admin-sidebar-divider" />
      <span className="admin-nav-label">ESPACE DE PUBLICATION</span>
      <nav aria-label="Administration">{Object.entries(sections).map(([key, label]) => <button key={key} disabled={busy} aria-current={section === key ? 'page' : undefined} onClick={() => changeSection(key)}><AdminIcon name={key} /><span>{label}</span><AdminIcon name="chevron" /></button>)}</nav>
      <div className="admin-sidebar-note"><span className="admin-note-icon"><AdminIcon name="globe" /></span><strong>Une voix, deux langues.</strong><p>Partagez vos contenus en français et en anglais.</p><span className="admin-note-languages">FR <span>↔</span> EN</span></div>
      <a href="/" className="admin-site-link"><AdminIcon name="external" /> Voir le site public</a>
      <div className="admin-profile"><span className="admin-avatar">{(session.user.name || session.user.email).slice(0, 1).toUpperCase()}</span><div><strong>{session.user.name || session.user.email}</strong><span>Administrateur</span></div><button disabled={busy} title="Se déconnecter" aria-label="Se déconnecter" onClick={async () => {
        setBusy(true); setError('')
        try { await request('/logout', { method: 'POST' }); setSession(null); setItems([]); setEditor(null) }
        catch (err) { setError(err.message) }
        finally { setBusy(false) }
      }}><AdminIcon name="logout" /></button></div>
    </aside>
    <div className="admin-workspace">
      <div className="admin-topbar"><div className="admin-breadcrumb"><AdminIcon name="grid" /><span>Administration</span><span className="admin-breadcrumb-slash">/</span><strong>{sections[section]}</strong></div><span className="admin-connection"><i /> Session active</span></div>
      <main className="admin-main">
        <header className="admin-heading"><div><span className="admin-eyebrow">VOTRE ESPACE ÉDITORIAL</span><h1>{sections[section]}<span className="admin-heading-dot" aria-hidden="true">.</span></h1><p>{section === 'news' ? 'Faites vivre l’actualité de l’ONIP.' : section === 'documents' ? 'Rendez l’information utile accessible à tous.' : section === 'carousel' ? 'Ajoutez de nouvelles photos, remplacez-les ou supprimez des diapositives. Les changements publiés apparaissent immédiatement sur le site.' : section === 'contacts' ? 'Gardez vos coordonnées à jour pour les visiteurs.' : 'Racontez nos actions en images.'}</p></div>{section !== 'contacts' && <button className="admin-primary" disabled={busy} onClick={() => { setEditor({ ...emptyContent(section), position: section === 'carousel' ? Math.min(100, Math.max(0, ...items.map(item => item.position)) + 1) : 1 }); setLocale('fr'); setError(''); setNotice('') }}><AdminIcon name="plus" />{section === 'carousel' ? 'Ajouter une photo au carrousel' : 'Nouveau contenu'}</button>}</header>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        {notice && <div className="admin-success" role="status"><AdminIcon name="check" />{notice}</div>}
        {section === 'contacts' ? <ContactEditor request={request} onBusyChange={setBusy} /> : editor ? <form className="admin-editor" onSubmit={save}>
          <div className="admin-editor-heading"><div><span className="admin-eyebrow">RÉDACTION & PUBLICATION</span><h2>{section === 'carousel' ? (editor.id ? 'Modifier la diapositive' : 'Nouvelle photo du carrousel') : (editor.id ? 'Modifier le contenu' : 'Nouveau contenu')}</h2></div><button type="button" disabled={busy} onClick={() => setEditor(null)}>Fermer ×</button></div>
          <fieldset disabled={busy}>
            {section === 'carousel' ? <div className="admin-carousel-editor">
              <ResourcePicker simple kind="image" value={editor.resourceUrl} disabled={busy} request={request} onBusyChange={setBusy} onChange={value => setEditor(previous => ({ ...previous, resourceUrl: value }))} />
              <label>Texte de la photo<textarea required rows={9} maxLength={500} placeholder="Écrivez le texte qui accompagne cette photo…" value={editor.carouselText ?? [editor.title.fr, editor.body.fr].filter(Boolean).join('\n')} onChange={event => setEditor(previous => ({ ...previous, carouselText: event.target.value }))} /></label>
            </div> : <>
            <div className="admin-language-bar"><div className="admin-language" role="group" aria-label="Langue du contenu">{['fr', 'en'].map(code => <button type="button" key={code} aria-pressed={locale === code} onClick={() => setLocale(code)}>{code === 'fr' ? 'Français' : 'English'}{editor.title[code].trim() && <AdminIcon name="check" />}</button>)}</div><span><AdminIcon name="globe" /> Contenu bilingue</span></div>
            <label>Titre · {locale.toUpperCase()}<input value={editor.title[locale]} maxLength={180} placeholder={locale === 'fr' ? 'Donnez un titre à votre contenu' : 'Give your content a title'} onChange={e => updateText('title', e.target.value)} /></label>
            <label>{section === 'news' ? 'Article' : 'Description'} · {locale.toUpperCase()}<textarea rows={9} maxLength={section === 'carousel' ? 500 : 20000} placeholder={locale === 'fr' ? 'Votre texte commence ici…' : 'Your story starts here…'} value={editor.body[locale]} onChange={e => updateText('body', e.target.value)} /></label>
            <ResourcePicker kind={section === 'documents' ? 'document' : 'image'} value={editor.resourceUrl} disabled={busy} request={request} onBusyChange={setBusy} onChange={value => setEditor(previous => ({ ...previous, resourceUrl: value }))} />
            <div className="admin-editor-settings">
            <label>Visibilité<select value={editor.status} onChange={e => setEditor({ ...editor, status: e.target.value })}><option value="draft">Brouillon — non visible sur le site</option><option value="published">Publié — visible sur le site</option></select></label></div>
            </>}
          </fieldset>
          <div className="admin-editor-actions">{editor.id && <button className="admin-danger" type="button" disabled={busy} onClick={remove}>Supprimer</button>}<button type="button" disabled={busy} onClick={() => setEditor(null)}>Annuler</button><button className="admin-primary" disabled={busy}><AdminIcon name="check" />{busy ? 'Enregistrement…' : section === 'carousel' ? 'Enregistrer' : editor.status === 'published' ? 'Enregistrer et publier' : 'Enregistrer le brouillon'}</button></div>
        </form> : <>
          <div className="admin-metrics">
            <div className="admin-metric-total"><div className="admin-metric-top"><span>Tous les contenus</span><span className="admin-metric-icon"><AdminIcon name="grid" /></span></div><strong>{loading ? '—' : String(items.length).padStart(2, '0')}</strong><small>Votre bibliothèque éditoriale</small><span className="admin-metric-decoration" aria-hidden="true" /></div>
            <div className="admin-metric-published"><div className="admin-metric-top"><span>Publiés</span><span className="admin-metric-icon"><AdminIcon name="check" /></span></div><strong>{loading ? '—' : String(items.filter(item => item.status === 'published').length).padStart(2, '0')}</strong><small><i /> En ligne sur le site</small></div>
            <div className="admin-metric-draft"><div className="admin-metric-top"><span>Brouillons</span><span className="admin-metric-icon"><AdminIcon name="edit" /></span></div><strong>{loading ? '—' : String(items.filter(item => item.status === 'draft').length).padStart(2, '0')}</strong><small>À préparer, à peaufiner, à partager</small></div>
          </div>
          <section className="admin-content-list" aria-label="Contenus">
            <div className="admin-list-heading"><div><h2>Votre bibliothèque <span>{items.length}</span></h2><p>Retrouvez et gérez vos {sections[section].toLowerCase()}.</p></div>{section !== 'carousel' && <span className="admin-list-language"><AdminIcon name="globe" /> FR / EN</span>}</div>
            <div className="admin-toolbar"><div className="admin-search"><AdminIcon name="search" /><input type="search" aria-label="Rechercher un contenu" placeholder="Rechercher un contenu…" value={query} onChange={e => setQuery(e.target.value)} /></div><select aria-label="Filtrer par statut" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tous les statuts</option><option value="published">Publiés</option><option value="draft">Brouillons</option></select></div>
            {loading ? <p className="admin-empty" role="status">Chargement des contenus…</p> : visible.length ? <><div className="admin-table-labels" aria-hidden="true"><span>CONTENU</span><span>STATUT</span><span /></div><div className="admin-rows">{visible.map(item => <button className="admin-row" key={item.id} onClick={() => { setEditor(structuredClone(item)); setLocale('fr'); setNotice(''); setError('') }}><span className={`admin-row-icon ${section}`}>{section === 'carousel' ? <img className="admin-carousel-thumbnail" src={item.resourceUrl} alt="" /> : <AdminIcon name={section} />}</span><span className="admin-row-copy"><strong>{item.title.fr}</strong><small>{section === 'carousel' ? item.body.fr : item.title.en || 'Traduction anglaise à compléter'}</small></span><span className={`admin-status ${item.status}`}><i />{item.status === 'published' ? 'Publié' : 'Brouillon'}</span><span className="admin-row-edit"><AdminIcon name="edit" /></span></button>)}</div><div className="admin-list-footer">{visible.length} contenu{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''}<span>Cliquez sur un contenu pour le modifier <AdminIcon name="arrow" /></span></div></> : <div className="admin-empty"><span className="admin-empty-icon"><AdminIcon name={items.length ? 'search' : section} /></span><h2>{items.length ? 'Aucun résultat' : 'Vos contenus commencent ici.'}</h2><p>{items.length ? 'Modifiez votre recherche ou le filtre.' : 'Une actualité, un document, une image : partagez ce qui compte.'}</p></div>}
          </section>
        </>}
        <div className="admin-workspace-footer"><span>ONIP <i /> Office National d’Identification de la Population</span><span>Administration · {new Date().getFullYear()}</span></div>
      </main>
    </div>
  </div>
}
