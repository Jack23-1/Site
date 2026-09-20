import { useLanguage } from "./i18n/LanguageContext";
import PropTypes from 'prop-types'
import './Footer.css'
import logofooter from './assets/logofooter.png'

const socialLinks = [
  {
    label: 'X officiel de l’ONIP RDC',
    field: 'xUrl',
    path: 'M18.9 2H22l-6.8 7.8L23 22h-6.3l-5-7.6L5.1 22H2l8.3-9.5L1 2h6.5l4.6 7L18.9 2Zm-1.1 18h1.7L6.6 4H4.8L17.8 20Z',
  },
  {
    label: 'Chaîne YouTube officielle de l’ONIP',
    field: 'youtubeUrl',
    path: 'M23 7s-.2-2-1-2.8C21.1 3.3 20 3.3 19.5 3.2 16 3 12 3 12 3s-4 0-7.5.2C4 3.3 2.9 3.3 2 4.2 1.2 5 1 7 1 7s-.2 2.2-.2 4.5v1C.8 14.8 1 17 1 17s.2 2 1 2.8c.9.9 2.1.9 2.6 1C6.5 21 12 21 12 21s4 0 7.5-.2c.5-.1 1.6-.1 2.5-1 .8-.8 1-2.8 1-2.8s.2-2.2.2-4.5v-1C23.2 9.2 23 7 23 7ZM10 16V8l7 4-7 4Z',
  },
  {
    label: 'Page Facebook officielle de l’ONIP',
    field: 'facebookUrl',
    path: 'M14 22v-9h3l.5-4H14V7c0-1.2.3-2 2-2h2V1.4A23 23 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9Z',
  },
]

export default function Footer({ onService, onAbout, onAccessibility, accessible, contact }) {
  const { t, language } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-main">
          <section className="footer-brand-block" aria-label="ONIP">
            <a href="#" className="footer-brand" aria-label={t("ONIP — Retour à l’accueil")}>
              <img className="footer-official-logo" src={logofooter} alt="ONIP" width="2480" height="1155" />
            </a>
            
           
          </section>

          <nav className="footer-column" aria-label={t("L’Etablissement ")}>
           
            <button onClick={onAbout}>{t("À propos de l’ONIP")}</button>
            <a href="#actualites">{t("Nos actualités")}</a>
            <a href="#couverture">{t("Nos Bureaux en RDC")}</a>
            <a href="#contenu">{t("Accueil")}</a>
          </nav>

          <nav className="footer-column" aria-label={t("Vos démarches")}>
            <h3>{t("Vos démarches")}</h3>
            <button onClick={() => onService(0)}>{t("Trouver un centre")}</button>
            
            <button onClick={() => onService(2)}>{t("Conditions d’identification")}</button>
            <a href="#services">{t("Tous nos services")}</a>
          </nav>

          <section className="footer-connect" aria-label={t("Assistance et réseaux sociaux")}>
            <h3>{t("Contact & assistance")}</h3>
            <p>{t("Besoin d’une information ou d’un accompagnement dans vos démarches ?")}</p>
            {contact && <address className="footer-contact-details">
              {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
              {contact.phone && <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>{contact.phone}</a>}
              {contact.address[language] && <span>{contact.address[language]}</span>}
              {contact.hours[language] && <span>{contact.hours[language]}</span>}
            </address>}
            <button className="footer-assistance" onClick={() => onService(3)}>{t("Besoin d’aide ?")}<span aria-hidden="true">↗</span>
            </button>
            <div className="footer-social-links" aria-label={t("Réseaux sociaux")}>
              {socialLinks.filter(link => contact?.[link.field]).map(link => (
                <a key={t(link.label)} href={contact[link.field]} target="_blank" rel="noopener noreferrer" aria-label={t(link.label)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={link.path} />
                  </svg>
                </a>
              ))}
            </div>
            <small>{t("Suivez les canaux officiels de l’ONIP")}</small>
          </section>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()}{t(" ONIP. Tous droits réservés.")}</p>
          <div>
            <button onClick={onAccessibility} aria-pressed={accessible}>{t("Accessibilité")}<span aria-hidden="true">◉</span>
            </button>
            <a className="back-to-top" href="#">{t("Retour en haut")}<span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-tricolor" aria-hidden="true" />
    </footer>
  )
}

Footer.propTypes = {
  onService: PropTypes.func.isRequired,
  onAbout: PropTypes.func.isRequired,
  onAccessibility: PropTypes.func.isRequired,
  accessible: PropTypes.bool.isRequired,
  contact: PropTypes.object,
}
