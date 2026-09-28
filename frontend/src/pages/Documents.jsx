import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import usePublishedContent from '../usePublishedContent'
import './Documents.css'

export default function Documents() {
  const { language, locale } = useLanguage()
  const { items, loading, error, hasMore, reload, loadMore } = usePublishedContent('documents')
  const [selected, setSelected] = useState(null)
  const dialog = useRef(null)
  const text = (fr, en) => language === 'fr' ? fr : en
  const localized = value => value?.[language] || value?.fr || value?.en || ''

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
      <h1>Documents</h1>
    </div>
    {error && <p role="alert">{text('Impossible de charger les documents.', 'Unable to load documents.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
    {!loading && !error && !items.length && <p className="document-empty">{text('Les documents seront disponibles prochainement.', 'Documents will be available soon.')}</p>}
    <div className="document-grid">
      {items.map((item, index) => <article className="document-card" key={item.id} style={{ '--document-delay': `${Math.min(index, 5) * 70}ms` }}>
        <button type="button" className="document-preview" onClick={() => setSelected(item)} aria-label={`${text('Aperçu de', 'Preview')} ${localized(item.title)}`}>
          <span className="document-preview-top"><span>PDF</span>{item.isExample && <span className="document-sample">{text('Exemple', 'Sample')}</span>}</span>
          {item.previewUrl ? <img className="document-paper" src={item.previewUrl} alt="" loading="lazy" /> : <span className="document-paper document-cover"><strong>ONIP</strong><span className="tricolor" /><b>{localized(item.title)}</b><span>{text('Document à consulter', 'Document to read')}</span><i aria-hidden="true" /></span>}
          <span className="document-preview-cta">{text('Ouvrir l’aperçu', 'Open preview')} <span aria-hidden="true">↗</span></span>
        </button>
        <div className="document-card-content">
          <div className="document-meta"><span>{text('DOCUMENT PDF', 'PDF DOCUMENT')}</span>{item.pageCount && <span>{item.pageCount} page{item.pageCount > 1 ? 's' : ''}</span>}{item.sizeBytes && <span>{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(item.sizeBytes / 1024)} {text('Ko', 'KB')}</span>}</div>
          <h2>{localized(item.title)}</h2>
          <p>{localized(item.body)}</p>
          <a className="document-download" href={item.resourceUrl} download target="_blank" rel="noopener noreferrer"><span>{text('Télécharger le PDF', 'Download PDF')}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg></a>
        </div>
      </article>)}
    </div>
    {loading && <p role="status">{text('Chargement des documents…', 'Loading documents…')}</p>}
    {hasMore && !error && <button className="document-more" disabled={loading} onClick={loadMore}>{text('Voir plus de documents', 'Load more documents')}</button>}
    <dialog className="document-dialog" ref={dialog} aria-labelledby="document-dialog-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)}>
      {selected && <>
        <div className="document-dialog-header"><div><span className="document-eyebrow">{text('APERÇU DU DOCUMENT', 'DOCUMENT PREVIEW')}</span><h2 id="document-dialog-title">{localized(selected.title)}</h2></div><button type="button" autoFocus onClick={() => setSelected(null)} aria-label={text('Fermer l’aperçu', 'Close preview')}>×</button></div>
        <div className="document-dialog-preview">{selected.previewUrl ? <img src={selected.previewUrl} alt={text('Première page du document', 'First page of the document')} /> : <iframe title={localized(selected.title)} src={selected.resourceUrl} />}</div>
        <div className="document-dialog-footer"><p>{selected.isExample ? text('Exemple de démonstration · Sans valeur officielle', 'Demonstration sample · Not an official document') : text('Si l’aperçu ne s’affiche pas, ouvrez ou téléchargez le document.', 'If the preview does not display, open or download the document.')}</p><a className="document-download" href={selected.resourceUrl} download target="_blank" rel="noopener noreferrer">{text('Télécharger le PDF', 'Download PDF')} <span aria-hidden="true">↓</span></a></div>
      </>}
    </dialog>
  </section>
}
