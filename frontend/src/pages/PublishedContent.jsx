import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import usePublishedContent from '../usePublishedContent'
import './PublishedContent.css'

const titles = { news: { fr: 'Actualités', en: 'News' }, documents: { fr: 'Documents', en: 'Documents' }, gallery: { fr: 'Galerie', en: 'Gallery' } }
export default function PublishedContent({ type }) {
  const { language, locale } = useLanguage()
  const { items, loading, error, hasMore, reload, loadMore } = usePublishedContent(type, type === 'news' ? 100 : 24)
  const text = (fr, en) => language === 'fr' ? fr : en
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const newsItems = type === 'news' ? items : []
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null)
  const [expandedGalleryGroup, setExpandedGalleryGroup] = useState(null)
  const getBody = item => item.body[language] || item.body.fr || item.body.en || ''
  const getTitle = item => item.title[language] || item.title.fr || item.title.en || ''
  const getExcerpt = (item, max = 150) => {
    const body = getBody(item).replace(/\s+/g, ' ').trim()
    return body.length > max ? `${body.slice(0, max).trim()}…` : body
  }
  useEffect(() => {
    if (!selectedGalleryItem) return undefined
    const onKeyDown = event => {
      if (event.key === 'Escape') setSelectedGalleryItem(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selectedGalleryItem])

  if (type === 'news') {
    return <section className="container published-content published-news">
      <div className="published-news-hero">
        <div>
          <h1>{titles[type][language]}</h1>
          <div className="tricolor" />
        </div>
        <p>{text('Retrouvez les communiqués, annonces et nouvelles de l’Office National d’Identification de la Population.', 'Read announcements, updates and news from the National Office for Population Identification.')}</p>
      </div>
      {error && <p role="alert">{text('Impossible de charger les contenus.', 'Unable to load content.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
      {!loading && !error && !items.length && <p className="published-empty">{text('Les actualités seront disponibles prochainement.', 'News will be available soon.')}</p>}
      <div className="published-news-list">
        {newsItems.map(item => <article className="published-news-card" key={item.id}>
          {item.resourceUrl && <img src={item.resourceUrl} alt="" loading="lazy" />}
          <div className="published-news-card-body">
            {item.publishedAt && <time dateTime={item.publishedAt}>{dateFormatter.format(new Date(item.publishedAt))}</time>}
            <h2>{getTitle(item)}</h2>
            {getExcerpt(item) && <p>{getExcerpt(item)}</p>}
            <details>
              <summary>{text('Lire l’article', 'Read article')}</summary>
              <p>{getBody(item)}</p>
            </details>
          </div>
        </article>)}
      </div>
      {loading && <p role="status">{text('Chargement…', 'Loading…')}</p>}
      {hasMore && !error && <button className="published-more" disabled={loading} onClick={loadMore}>{text('Voir plus', 'Load more')}</button>}
    </section>
  }

  if (type === 'gallery') {
    const galleryGroups = Array.from(items.reduce((groups, item) => {
      const title = getTitle(item).trim() || text('Événement sans titre', 'Untitled event')
      const key = title.toLocaleLowerCase(locale)
      const existing = groups.get(key)
      if (existing) {
        existing.items.push(item)
      } else {
        groups.set(key, { key, title, items: [item] })
      }
      return groups
    }, new Map()).values())

    return <section className="container published-content published-gallery">
      <div className="published-gallery-heading">
        <div>
          <h1>{titles[type][language]}</h1>
          <div className="tricolor" />
        </div>
        <p>{text('Images officielles des activités, centres et moments marquants de l’ONIP.', 'Official images from ONIP activities, centres and key moments.')}</p>
      </div>
      {error && <p role="alert">{text('Impossible de charger les contenus.', 'Unable to load content.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
      {!loading && !error && !items.length && <p className="published-empty">{text('Les photos seront disponibles prochainement.', 'Photos will be available soon.')}</p>}
      <div className="published-gallery-events">
        {galleryGroups.map((group, groupIndex) => {
          const expanded = expandedGalleryGroup === group.key
          const cover = group.items[0]
          return <article className={expanded ? 'published-gallery-event is-expanded' : 'published-gallery-event'} key={group.key} style={{ '--event-index': groupIndex }}>
            <button className="published-gallery-stack" type="button" aria-expanded={expanded} onClick={() => setExpandedGalleryGroup(expanded ? null : group.key)}>
              <span className="published-gallery-stack-images" aria-hidden="true">
                {group.items.slice(0, 3).map((item, index) => <img key={item.id} src={item.resourceUrl} alt="" loading="lazy" style={{ '--stack-index': index }} />)}
              </span>
              <span className="published-gallery-stack-copy">
                <strong>{group.title}</strong>
                <small>{group.items.length} photo{group.items.length > 1 ? 's' : ''}</small>
              </span>
            </button>
            {expanded && <div className="published-gallery-grid">
              {group.items.map((item, index) => <button className="published-gallery-item" key={item.id} type="button" onClick={() => setSelectedGalleryItem(item)} style={{ '--photo-index': index }}>
                <img src={item.resourceUrl} alt={getBody(item) || group.title} loading="lazy" />
                <span>
                  <strong>{getBody(item) || group.title}</strong>
                </span>
              </button>)}
            </div>}
            {!expanded && cover && <button className="published-gallery-cover-open" type="button" onClick={() => setSelectedGalleryItem(cover)}>
              {text('Aperçu', 'Preview')}
            </button>}
          </article>
        })}
      </div>
      {loading && <p role="status">{text('Chargement…', 'Loading…')}</p>}
      {hasMore && !error && <button className="published-more" disabled={loading} onClick={loadMore}>{text('Voir plus', 'Load more')}</button>}
      {selectedGalleryItem && <div className="published-gallery-lightbox" role="dialog" aria-modal="true" aria-label={getTitle(selectedGalleryItem)} onClick={() => setSelectedGalleryItem(null)}>
        <button className="published-gallery-close" type="button" onClick={() => setSelectedGalleryItem(null)} aria-label={text('Fermer l’aperçu', 'Close preview')}>×</button>
        <figure onClick={event => event.stopPropagation()}>
          <img src={selectedGalleryItem.resourceUrl} alt={getTitle(selectedGalleryItem)} />
          <figcaption>
            <strong>{getTitle(selectedGalleryItem)}</strong>
            {getBody(selectedGalleryItem) && <span>{getBody(selectedGalleryItem)}</span>}
          </figcaption>
        </figure>
      </div>}
    </section>
  }

  return <section className={`container published-content published-${type}`}>
    <span className="published-eyebrow">ONIP</span><h1>{titles[type][language]}</h1><div className="tricolor" />
    {error && <p role="alert">{text('Impossible de charger les contenus.', 'Unable to load content.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
    {!loading && !error && !items.length && <p className="published-empty">{text('Les contenus seront disponibles prochainement.', 'Content will be available soon.')}</p>}
    <div className="published-grid">{items.map(item => <article className="published-card" key={item.id}>
      {type !== 'documents' && item.resourceUrl && <img src={item.resourceUrl} alt={type === 'gallery' ? item.title[language] : ''} loading="lazy" />}
      <div className="published-card-body">
        <h2>{item.title[language]}</h2>
        <p>{item.body[language]}</p>
        {type === 'documents' && <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer">{text('Consulter le document', 'View document')} ↗</a>}
      </div>
    </article>)}</div>
    {loading && <p role="status">{text('Chargement…', 'Loading…')}</p>}
    {hasMore && !error && <button className="published-more" disabled={loading} onClick={loadMore}>{text('Voir plus', 'Load more')}</button>}
  </section>
}
PublishedContent.propTypes = { type: PropTypes.oneOf(['news', 'documents', 'gallery']).isRequired }
