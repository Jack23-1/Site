import { useCallback, useEffect, useState } from 'react'
import { adminRequest } from './api'
import logo from '../assets/logoonip.png'
import './Admin.css'

const sections = { news: 'Actualités', documents: 'Documents', gallery: 'Galerie' }
const emptyContent = type => ({ type, status: 'draft', title: { fr: '', en: '' }, body: { fr: '', en: '' }, resourceUrl: '' })

export default function Admin() {
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
    if (!session?.user) return
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
    if (!editor.title.fr.trim() || !editor.title.en.trim()) { setError('Renseignez le titre en français et en anglais.'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const { item } = await request(editor.id ? `/content/${editor.id}` : '/content', { method: editor.id ? 'PUT' : 'POST', body: editor })
      setItems(previous => [item, ...previous.filter(entry => entry.id !== item.id)])
      setEditor(null)
      setNotice(item.status === 'published' ? 'Le contenu a été publié.' : 'Le brouillon a été enregistré.')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  const remove = async () => {
    if (!window.confirm('Supprimer définitivement ce contenu ?')) return
    setBusy(true); setError('')
    try {
      await request(`/content/${editor.id}`, { method: 'DELETE' })
      setItems(previous => previous.filter(item => item.id !== editor.id))
      setEditor(null); setNotice('Le contenu a été supprimé.')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  const changeSection = next => { setSection(next); setEditor(null); setQuery(''); setFilter('all'); setNotice(''); setError('') }
  const updateText = (field, value) => setEditor(previous => ({ ...previous, [field]: { ...previous[field], [locale]: value } }))
  const visible = items.filter(item => (filter === 'all' || item.status === filter) && `${item.title.fr} ${item.title.en}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))

  if (checking) return <main className="admin-root admin-login"><p role="status">Connexion à l’administration…</p></main>
  if (!session?.user) return <main className="admin-root admin-login">
    <section className="admin-login-card">
      <a href="/"><img src={logo} alt="ONIP — Accueil" /></a>
      <span className="admin-eyebrow">ESPACE ADMINISTRATION</span>
      <h1>Bienvenue.</h1><p>Connectez-vous pour gérer les contenus du site.</p>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <form onSubmit={login}>
        <label>Adresse e-mail<input name="email" type="email" autoComplete="username" required disabled={busy} /></label>
        <label>Mot de passe<input name="password" type="password" autoComplete="current-password" required disabled={busy} /></label>
        <button className="admin-primary" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter →'}</button>
      </form>
      {error && <button className="admin-link" onClick={checkSession}>Réessayer la connexion au serveur</button>}
      <a className="admin-link" href="/">← Retour au site</a>
    </section>
  </main>

  return <div className="admin-root admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><img src={logo} alt="ONIP" /></a>
      <span className="admin-eyebrow">ADMINISTRATION</span>
      <nav aria-label="Administration">{Object.entries(sections).map(([key, label], index) => <button key={key} disabled={busy} aria-current={section === key ? 'page' : undefined} onClick={() => changeSection(key)}><span>0{index + 1}</span>{label}</button>)}</nav>
      <a href="/" className="admin-site-link">Voir le site ↗</a>
      <div className="admin-profile"><strong>{session.user.name || session.user.email}</strong><span>Administrateur</span><button disabled={busy} onClick={async () => {
        setBusy(true); setError('')
        try { await request('/logout', { method: 'POST' }); setSession(null); setItems([]); setEditor(null) }
        catch (err) { setError(err.message) }
        finally { setBusy(false) }
      }}>Se déconnecter</button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-heading"><div><span className="admin-eyebrow">GESTION DES CONTENUS</span><h1>{sections[section]}</h1><p>Préparez vos contenus, puis publiez-les en deux langues.</p></div><button className="admin-primary" disabled={busy} onClick={() => { setEditor(emptyContent(section)); setLocale('fr'); setError(''); setNotice('') }}>+ Nouveau contenu</button></header>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      {notice && <div className="admin-success" role="status">{notice}</div>}
      {editor ? <form className="admin-editor" onSubmit={save}>
        <div className="admin-editor-heading"><h2>{editor.id ? 'Modifier le contenu' : 'Nouveau contenu'}</h2><button type="button" disabled={busy} onClick={() => setEditor(null)}>Fermer ×</button></div>
        <fieldset disabled={busy}>
          <div className="admin-language" role="group" aria-label="Langue du contenu">{['fr', 'en'].map(code => <button type="button" key={code} aria-pressed={locale === code} onClick={() => setLocale(code)}>{code === 'fr' ? 'Français' : 'English'}<span>{editor.title[code].trim() ? ' ✓' : ''}</span></button>)}</div>
          <label>Titre · {locale.toUpperCase()}<input value={editor.title[locale]} maxLength={180} onChange={e => updateText('title', e.target.value)} /></label>
          <label>{section === 'news' ? 'Article' : 'Description'} · {locale.toUpperCase()}<textarea rows={9} maxLength={20000} value={editor.body[locale]} onChange={e => updateText('body', e.target.value)} /></label>
          <label>{section === 'documents' ? 'Lien du document (HTTPS)' : 'Lien de l’image (HTTPS)'}<input type="url" pattern="https://.*" value={editor.resourceUrl} required={section !== 'news'} placeholder="https://…" onChange={e => setEditor({ ...editor, resourceUrl: e.target.value })} /></label>
          <label>Visibilité<select value={editor.status} onChange={e => setEditor({ ...editor, status: e.target.value })}><option value="draft">Brouillon — non visible sur le site</option><option value="published">Publié — visible sur le site</option></select></label>
        </fieldset>
        <div className="admin-editor-actions">{editor.id && <button className="admin-danger" type="button" disabled={busy} onClick={remove}>Supprimer</button>}<button type="button" disabled={busy} onClick={() => setEditor(null)}>Annuler</button><button className="admin-primary" disabled={busy}>{busy ? 'Enregistrement…' : editor.status === 'published' ? 'Enregistrer et publier' : 'Enregistrer le brouillon'}</button></div>
      </form> : <>
        <div className="admin-metrics"><div><span>Total</span><strong>{items.length}</strong></div><div><span>Publiés</span><strong>{items.filter(item => item.status === 'published').length}</strong></div><div><span>Brouillons</span><strong>{items.filter(item => item.status === 'draft').length}</strong></div></div>
        <section className="admin-content-list" aria-label="Contenus">
          <div className="admin-toolbar"><input type="search" aria-label="Rechercher un contenu" placeholder="Rechercher un contenu…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filtrer par statut" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tous les statuts</option><option value="published">Publiés</option><option value="draft">Brouillons</option></select></div>
          {loading ? <p className="admin-empty" role="status">Chargement des contenus…</p> : visible.length ? <div className="admin-rows">{visible.map(item => <button className="admin-row" key={item.id} onClick={() => { setEditor(structuredClone(item)); setLocale('fr'); setNotice(''); setError('') }}><span><strong>{item.title.fr}</strong><small>{item.title.en || 'Traduction anglaise à compléter'}</small></span><span className={`admin-status ${item.status}`}>{item.status === 'published' ? 'Publié' : 'Brouillon'}</span><span aria-hidden="true">↗</span></button>)}</div> : <div className="admin-empty"><h2>{items.length ? 'Aucun résultat' : 'Vos contenus commencent ici.'}</h2><p>{items.length ? 'Modifiez votre recherche ou le filtre.' : 'Créez un premier contenu et préparez ses versions française et anglaise.'}</p></div>}
        </section>
      </>}
    </main>
  </div>
}
