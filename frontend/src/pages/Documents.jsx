import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import usePublishedContent from '../usePublishedContent'
import logoFingerprint from '../assets/onip-loader-center.png'
import './Documents.css'

function DownloadFingerprint() {
  return <span className="document-fingerprint" aria-hidden="true">
    <img src={logoFingerprint} alt="" />
  </span>
}

export default function Documents() {
  const { language, locale } = useLanguage()
  const { items, loading, error, hasMore, reload, loadMore } = usePublishedContent('documents')
  const [selected, setSelected] = useState(null)
  const dialog = useRef(null)
  const text = (fr, en) => language === 'fr' ? fr : en
  const localized = value => value?.[language] || value?.fr || value?.en || ''
  const documentKind = item => /^décret/i.test(item.title?.fr || '')
    ? text('Décret', 'Decree') : /^arrêté/i.test(item.title?.fr || '')
      ? text('Arrêté', 'Order') : text('Document', 'Document')
  const fileSize = bytes => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / (bytes >= 1048576 ? 1048576 : 1024)) + ' ' + (bytes >= 1048576 ? text('Mo', 'MB') : text('Ko', 'KB'))

  useEffect(() => {
    if (!selected) return undefined
    const modal = dialog.current
    const previousOverflow = document.body.style.overflow
    modal.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      modal.close()
      document.body.style.overflow = previousOverflow
    }
  }, [selected])

  return <section className="container document-library">
    <div className="document-heading">
      <div>
        <h1>Documents<span>.</span></h1>
        <p>{text('Les textes de référence de l’ONIP, à consulter et à télécharger.', 'ONIP reference documents, available to view and download.')}</p>
      </div>
    </div>
    {error && <p role="alert">{text('Impossible de charger les documents.', 'Unable to load documents.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
    {!loading && !error && !items.length && <p className="document-empty">{text('Les documents seront disponibles prochainement.', 'Documents will be available soon.')}</p>}
    <div className="document-grid">
      {items.map((item, index) => <article className="document-card" key={item.id} style={{ '--document-delay': `${Math.min(index, 5) * 70}ms` }}>
        <button type="button" className="document-preview" onClick={() => setSelected(item)} aria-label={`${text('Aperçu de', 'Preview')} ${localized(item.title)}`}>
          <span className="document-file-icon" aria-hidden="true">
            <svg width="42" height="50" viewBox="0 0 42 50" fill="none">
              <path d="M9 2h17l10 10v32a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z" fill="white" stroke="#e3a3a3" strokeWidth="1.3" />
              <path d="M26 2v7a3 3 0 0 0 3 3h7" fill="#fbe4e4" stroke="#e3a3a3" strokeWidth="1.3" />
              <path d="M14 29c5-7 9-17 7-18-3-1-2 9 3 13 3 3 8 4 8 2 0-3-12-1-17 1-6 3-7 6-4 6 2 0 4-3 6-6" stroke="#d63035" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="1" y="34" width="29" height="13" rx="3" fill="#d63035" />
              <text x="15.5" y="43.5" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" letterSpacing=".7">PDF</text>
            </svg>
          </span>
          <span className="document-preview-label"><span>{documentKind(item)}</span><span>PDF{item.isExample ? ` · ${text('Exemple', 'Sample')}` : ''}</span></span>
        </button>
        <div className="document-card-content">
          <h2>{localized(item.title)}</h2>
          <div className="document-meta">{item.pageCount && <span>{item.pageCount} page{item.pageCount > 1 ? 's' : ''}</span>}{item.sizeBytes && <span>{fileSize(item.sizeBytes)}</span>}<span>{text('Consultation & téléchargement', 'View & download')}</span></div>
          <div className="document-actions">
          <button type="button" className="document-view" onClick={() => setSelected(item)}>{text('Consulter', 'View')} <span aria-hidden="true">↗</span></button>
          <a className="document-download" href={item.resourceUrl} download target="_blank" rel="noopener noreferrer"><DownloadFingerprint /><span className="document-download-label"><span>{text('Télécharger', 'Download')}</span></span></a>
          </div>
        </div>
      </article>)}
    </div>
    {loading && <p role="status">{text('Chargement des documents…', 'Loading documents…')}</p>}
    {hasMore && !error && <button className="document-more" disabled={loading} onClick={loadMore}>{text('Voir plus de documents', 'Load more documents')}</button>}
    <dialog className="document-dialog" ref={dialog} aria-labelledby="document-dialog-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)}>
      {selected && <>
        <div className="document-dialog-header"><div><span className="document-eyebrow">{text('APERÇU DU DOCUMENT', 'DOCUMENT PREVIEW')}</span><h2 id="document-dialog-title">{localized(selected.title)}</h2></div><button type="button" autoFocus onClick={() => setSelected(null)} aria-label={text('Fermer l’aperçu', 'Close preview')}>×</button></div>
        <div className="document-dialog-preview">{selected.previewUrl ? <img src={selected.previewUrl} alt={text('Première page du document', 'First page of the document')} /> : <iframe title={localized(selected.title)} src={selected.resourceUrl} />}</div>
        <div className="document-dialog-footer"><p>{selected.isExample ? text('Exemple de démonstration · Sans valeur officielle', 'Demonstration sample · Not an official document') : text('Si l’aperçu ne s’affiche pas, ouvrez ou téléchargez le document.', 'If the preview does not display, open or download the document.')}</p><a className="document-download" href={selected.resourceUrl} download target="_blank" rel="noopener noreferrer"><DownloadFingerprint /><span className="document-download-label"><span>{text('Télécharger', 'Download')}</span></span></a></div>
      </>}
    </dialog>
  </section>
}
