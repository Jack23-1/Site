import PropTypes from 'prop-types'
import { useState } from 'react'
import { useLanguage } from './i18n/LanguageContext'

export default function VideoCard({ src, poster, continuationUrl }) {
  const { language } = useLanguage()
  const [ended, setEnded] = useState(false)
  const text = (fr, en) => language === 'fr' ? fr : en

  return <section className="identity-video-card" aria-label={text('Vidéos ONIP', 'ONIP videos')}>
    {src ? <video controls playsInline preload="metadata" poster={poster} onEnded={() => setEnded(true)} onPlay={() => setEnded(false)} onSeeking={() => setEnded(false)} aria-label={text('Vidéo ONIP', 'ONIP video')}>
      <source src={src} />
      <a href={src}>{text('Ouvrir la vidéo', 'Open video')}</a>
    </video> : <div className="identity-video-placeholder">
      <span className="identity-video-label">ONIP <span>•</span> {text('VIDÉOS', 'VIDEOS')}</span>
      <span className="identity-video-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
      <strong>{text('L’ONIP en images', 'ONIP in pictures')}</strong>
      <span className="identity-video-status">{text('Les vidéos seront disponibles prochainement.', 'Videos will be available soon.')}</span>
    </div>}
    {ended && continuationUrl && <div className="identity-video-ended" aria-live="polite">
      <a href={continuationUrl} target="_blank" rel="noopener noreferrer">
        {text('Suivre la suite sur X', 'Watch the rest on X')} <span aria-hidden="true">↗</span>
      </a>
    </div>}
  </section>
}
VideoCard.propTypes = { src: PropTypes.string, poster: PropTypes.string, continuationUrl: PropTypes.string }
