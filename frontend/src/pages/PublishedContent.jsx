import PropTypes from 'prop-types'
import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import usePublishedContent from '../usePublishedContent'
import './PublishedContent.css'

const titles = { news: { fr: 'Actualités', en: 'News' }, documents: { fr: 'Documents', en: 'Documents' }, gallery: { fr: 'Galerie', en: 'Gallery' } }
function FingerprintNavigation() {
  return <svg viewBox="0 0 56 68" fill="none" aria-hidden="true" focusable="false">
    <g className="gallery-fingerprint-ridges" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M7 29C7 15 16 5 28 5s21 10 21 24v10" />
      <path d="M3 39v-8M12 46V29c0-11 6-19 16-19s16 8 16 19v17" />
      <path d="M8 51c-1-4-1-7-1-11M17 37v-8c0-8 4-14 11-14s11 6 11 14v9M48 46c-1 8-4 14-8 18" />
      <path d="M22 31v-2c0-5 2-9 6-9s6 4 6 9v3M13 52c1 5 3 9 6 12M43 51c-1 5-3 9-6 12" />
      <path d="M18 49c0 5 2 10 5 14M23 49c0 5 2 9 4 12M28 49c0 5 2 8 4 10M33 48c1 3 1 5 3 7M38 47v4M28 26v5" />
    </g>
    <path className="gallery-fingerprint-chevron" d="m25 34 6 6-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}
export default function PublishedContent({ type }) {
  const { language, locale } = useLanguage()
  const { items, loading, error, hasMore, reload, loadMore } = usePublishedContent(type, type === 'news' ? 100 : 24)
  const text = (fr, en) => language === 'fr' ? fr : en
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const newsItems = type === 'news' ? items : []
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null)
  const [stackExpanded, setStackExpanded] = useState(false)
  const moveGalleryPhoto = useCallback(direction => {
    const photos = items.filter(item => item.resourceUrl)
    if (photos.length < 2) return
    setSelectedGalleryItem(current => {
      if (!current) return current
      const index = photos.findIndex(item => item.id === current.id)
      return photos[(index + direction + photos.length) % photos.length]
    })
  }, [items])
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
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        moveGalleryPhoto(event.key === 'ArrowLeft' ? -1 : 1)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selectedGalleryItem, moveGalleryPhoto])

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
              <summary>
                <span className="news-read-more">{text('Lire la suite', 'Read more')}</span>
                <span className="news-read-less">{text('Réduire l’article', 'Collapse article')}</span>
              </summary>
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
      {error && <p role="alert">{text('Impossible de charger les contenus.', 'Unable to load content.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
      {!loading && !error && !items.length && <p className="published-empty">{text('Les photos seront disponibles prochainement.', 'Photos will be available soon.')}</p>}
      {galleryGroups.length === 1 ? (() => {
        const group = galleryGroups[0]
        const cover = group.items[0]
        const intro = getBody(cover) || text('Album officiel de la visite.', 'Official album of the visit.')

        return <div className="published-gallery-single">
          <button
            type="button"
            className={`published-gallery-stack ${stackExpanded ? 'is-expanded' : ''}`}
            onClick={() => setStackExpanded(value => !value)}
            aria-expanded={stackExpanded}
            aria-label={stackExpanded ? text('Réduire l’album', 'Collapse album') : text('Déplier l’album', 'Expand album')}
          >
            <div className="published-gallery-stack-cards">
              {group.items.slice(0, 4).map((item, index) => (
                <img
                  key={item.id}
                  className={`published-gallery-stack-photo stack-index-${index}`}
                  src={item.resourceUrl}
                  alt={getBody(item) || group.title}
                  loading="lazy"
                  style={{ '--stack-index': index }}
                />
              ))}
            </div>
            <div className="published-gallery-stack-meta">
              <span>{text('Album', 'Album')}</span>
              <strong>{group.title}</strong>
              <small>{group.items.length} photo{group.items.length > 1 ? 's' : ''}</small>
            </div>
          </button>

          {stackExpanded && (
            <div className="published-gallery-expanded">
              <div className="published-gallery-expanded-header">
                <p>{intro}</p>
                <button type="button" className="published-gallery-open-cover" onClick={() => setSelectedGalleryItem(cover)}>
                  {text('Ouvrir la couverture', 'Open cover')}
                </button>
              </div>
              <div className="published-gallery-expanded-grid">
                {group.items.map((item, index) => (
                  <button
                    key={item.id}
                    className="published-gallery-expanded-item"
                    type="button"
                    onClick={() => setSelectedGalleryItem(item)}
                    aria-label={`${text('Ouvrir la photo', 'Open photo')} ${index + 1}`}
                  >
                    <img src={item.resourceUrl} alt={getBody(item) || group.title} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      })() : <div className="published-gallery-albums">
        {galleryGroups.map((group, groupIndex) => {
          const cover = group.items[0]
          const previewItems = group.items.slice(1, 5)
          if (!cover) return null

          return <article className="published-gallery-album" key={group.key} style={{ '--album-index': groupIndex }}>
            <button className="published-gallery-cover" type="button" onClick={() => setSelectedGalleryItem(cover)}>
              <img src={cover.resourceUrl} alt={group.title} loading="lazy" />
              <span className="published-gallery-cover-overlay">
                <small>{text('Album', 'Album')}</small>
                <strong>{group.title}</strong>
                <em>{group.items.length} photo{group.items.length > 1 ? 's' : ''}</em>
              </span>
            </button>
            <div className="published-gallery-thumb-row">
              {previewItems.map((item, index) => (
                <button
                  key={item.id}
                  className="published-gallery-thumb"
                  type="button"
                  onClick={() => setSelectedGalleryItem(item)}
                  style={{ '--thumb-index': index }}
                  aria-label={`${text('Ouvrir la photo', 'Open photo')} ${index + 1}`}
                >
                  <img src={item.resourceUrl} alt={getBody(item) || group.title} loading="lazy" />
                </button>
              ))}
              {group.items.length > 5 && (
                <button
                  className="published-gallery-more"
                  type="button"
                  onClick={() => setSelectedGalleryItem(group.items[5])}
                  aria-label={text('Voir plus de photos', 'View more photos')}
                >
                  <span>+{group.items.length - 5}</span>
                </button>
              )}
            </div>
          </article>
        })}
      </div>}
      {loading && <p role="status">{text('Chargement…', 'Loading…')}</p>}
      {hasMore && !error && <button className="published-more" disabled={loading} onClick={loadMore}>{text('Voir plus', 'Load more')}</button>}
      {selectedGalleryItem && <div className="published-gallery-lightbox" role="dialog" aria-modal="true" aria-label={getTitle(selectedGalleryItem)} onClick={() => setSelectedGalleryItem(null)}>
        <button className="published-gallery-close" type="button" onClick={() => setSelectedGalleryItem(null)} aria-label={text('Fermer l’aperçu', 'Close preview')}>×</button>
        {items.filter(item => item.resourceUrl).length > 1 && <>
          <button className="published-gallery-arrow is-previous" type="button" onClick={event => { event.stopPropagation(); moveGalleryPhoto(-1) }} aria-label={text('Photo précédente', 'Previous photo')}><FingerprintNavigation /></button>
          <button className="published-gallery-arrow is-next" type="button" onClick={event => { event.stopPropagation(); moveGalleryPhoto(1) }} aria-label={text('Photo suivante', 'Next photo')}><FingerprintNavigation /></button>
        </>}
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
