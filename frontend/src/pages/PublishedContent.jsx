import PropTypes from 'prop-types'
import { useLanguage } from '../i18n/LanguageContext'
import usePublishedContent from '../usePublishedContent'
import './PublishedContent.css'

const titles = { news: { fr: 'Actualités', en: 'News' }, documents: { fr: 'Documents', en: 'Documents' }, gallery: { fr: 'Galerie', en: 'Gallery' } }
export default function PublishedContent({ type }) {
  const { language, locale } = useLanguage()
  const { items, loading, error, hasMore, reload, loadMore } = usePublishedContent(type)
  const text = (fr, en) => language === 'fr' ? fr : en
  return <section className={`container published-content published-${type}`}>
    <span className="published-eyebrow">ONIP</span><h1>{titles[type][language]}</h1><div className="tricolor" />
    {error && <p role="alert">{text('Impossible de charger les contenus.', 'Unable to load content.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
    {!loading && !error && !items.length && <p className="published-empty">{text('Les contenus seront disponibles prochainement.', 'Content will be available soon.')}</p>}
    <div className="published-grid">{items.map(item => <article className="published-card" key={item.id}>
      {type !== 'documents' && item.resourceUrl && <img src={item.resourceUrl} alt={type === 'gallery' ? item.title[language] : ''} loading="lazy" />}
      <div className="published-card-body">
        {type === 'news' && <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
        <h2>{item.title[language]}</h2>
        {type === 'news' ? <details><summary>{text('Lire l’article', 'Read article')}</summary><p>{item.body[language]}</p></details> : <p>{item.body[language]}</p>}
        {type === 'documents' && <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer">{text('Consulter le document', 'View document')} ↗</a>}
      </div>
    </article>)}</div>
    {loading && <p role="status">{text('Chargement…', 'Loading…')}</p>}
    {hasMore && !error && <button className="published-more" disabled={loading} onClick={loadMore}>{text('Voir plus', 'Load more')}</button>}
  </section>
}
PublishedContent.propTypes = { type: PropTypes.oneOf(['news', 'documents', 'gallery']).isRequired }
