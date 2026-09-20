import PropTypes from 'prop-types'
import { useLanguage } from '../i18n/LanguageContext'
import './Contacts.css'

export default function Contacts({ contact, loading, error, reload }) {
  const { language } = useLanguage()
  const text = (fr, en) => language === 'fr' ? fr : en
  const configured = contact && (contact.email || contact.phone || contact.address[language] || contact.hours[language] || contact.facebookUrl || contact.xUrl || contact.youtubeUrl)
  return <section className="container public-contacts">
    <span className="public-contact-eyebrow">ONIP · {text('À VOTRE ÉCOUTE', 'HERE TO HELP')}</span>
    <h1>{text('Contactez-nous', 'Contact us')}</h1><div className="tricolor" />
    <p className="public-contact-intro">{text('Une question sur nos services ? Retrouvez les coordonnées de l’ONIP.', 'Have a question about our services? Find ONIP’s contact details below.')}</p>
    {loading && <p role="status">{text('Chargement des coordonnées…', 'Loading contact details…')}</p>}
    {error && <p role="alert">{text('Les coordonnées sont momentanément indisponibles.', 'Contact details are temporarily unavailable.')} <button onClick={reload}>{text('Réessayer', 'Try again')}</button></p>}
    {!loading && !error && !configured && <p>{text('Les coordonnées officielles seront disponibles prochainement.', 'Official contact details will be available soon.')}</p>}
    {configured && <>
      <div className="public-contact-grid">
        {contact.email && <article><span className="public-contact-symbol" aria-hidden="true">@</span><h2>{text('Écrivez-nous', 'Email us')}</h2><a href={`mailto:${contact.email}`}>{contact.email}</a></article>}
        {contact.phone && <article><span className="public-contact-symbol" aria-hidden="true">☎</span><h2>{text('Appelez-nous', 'Call us')}</h2><a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>{contact.phone}</a></article>}
        {contact.address[language] && <article><span className="public-contact-symbol" aria-hidden="true">⌖</span><h2>{text('Notre adresse', 'Our address')}</h2><p>{contact.address[language]}</p></article>}
        {contact.hours[language] && <article><span className="public-contact-symbol" aria-hidden="true">◷</span><h2>{text('Horaires d’accueil', 'Opening hours')}</h2><p>{contact.hours[language]}</p></article>}
      </div>
      {(contact.facebookUrl || contact.xUrl || contact.youtubeUrl) && <div className="public-contact-socials"><h2>{text('Suivez nos canaux officiels', 'Follow our official channels')}</h2>{[['facebookUrl', 'Facebook'], ['xUrl', 'X'], ['youtubeUrl', 'YouTube']].map(([key, label]) => contact[key] && <a key={key} href={contact[key]} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>}
    </>}
  </section>
}
Contacts.propTypes = { contact: PropTypes.object, loading: PropTypes.bool, error: PropTypes.bool, reload: PropTypes.func }
