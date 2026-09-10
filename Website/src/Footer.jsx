import PropTypes from 'prop-types'
import './Footer.css'
import onipLogo from './assets/logoonip.png'

export default function Footer({ onService, onAbout, onAccessibility, accessible }) {
  return <footer className="site-footer">
    <div className="footer-glow" aria-hidden="true"/>
    <div className="container footer-container">
      <div className="footer-main">
        <div className="footer-brand-block"><a href="#" className="footer-brand" aria-label="ONIP — Retour à l’accueil"><img className="footer-official-logo" src={onipLogo} alt="ONIP" width="2480" height="1155"/></a><p>Office National d’Identification<br/>de la Population</p><span className="footer-country"><span aria-hidden="true">🇨🇩</span> Peuple · Unité · Travail</span></div>
        <nav className="footer-column" aria-label="L’institution"><h3>L’institution</h3><button onClick={onAbout}>À propos de l’ONIP</button><a href="#actualites">Nos actualités</a><a href="#couverture">Notre présence en RDC</a><a href="#contenu">Accueil</a></nav>
        <nav className="footer-column" aria-label="Vos démarches"><h3>Vos démarches</h3><button onClick={() => onService(0)}>Trouver un centre</button><button onClick={() => onService(1)}>Suivre ma demande</button><button onClick={() => onService(2)}>Conditions d’enrôlement</button><a href="#services">Tous nos services</a></nav>
        <div className="footer-connect"><h3>Restons connectés</h3><div className="footer-social-links"><a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X (plateforme, compte ONIP à venir)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-5-7.6L5.1 22H2l8.3-9.5L1 2h6.5l4.6 7L18.9 2Zm-1.1 18h1.7L6.6 4H4.8L17.8 20Z"/></svg></a><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube (plateforme, chaîne ONIP à venir)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7s-.2-2-1-2.8C21.1 3.3 20 3.3 19.5 3.2 16 3 12 3 12 3s-4 0-7.5.2C4 3.3 2.9 3.3 2 4.2 1.2 5 1 7 1 7s-.2 2.2-.2 4.5v1C.8 14.8 1 17 1 17s.2 2 1 2.8c.9.9 2.1.9 2.6 1C6.5 21 12 21 12 21s4 0 7.5-.2c.5-.1 1.6-.1 2.5-1 .8-.8 1-2.8 1-2.8s.2-2.2.2-4.5v-1C23.2 9.2 23 7 23 7ZM10 16V8l7 4-7 4Z"/></svg></a><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook (plateforme, page ONIP à venir)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.3-2 2-2h2V1.4A23 23 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9Z"/></svg></a></div><p>Comptes officiels à venir</p><button className="footer-assistance" onClick={() => onService(3)}>Besoin d’aide ? <span aria-hidden="true">↗</span></button></div>
      </div>

      <div className="footer-bottom"><p>© {new Date().getFullYear()} ONIP. Tous droits réservés.</p><div><button onClick={onAccessibility} aria-pressed={accessible}>Accessibilité <span aria-hidden="true">◉</span></button><a className="back-to-top" href="#">Retour en haut <span aria-hidden="true">↑</span></a></div></div>
    </div><div className="footer-tricolor" aria-hidden="true"/>
  </footer>
}
Footer.propTypes = { onService: PropTypes.func.isRequired, onAbout: PropTypes.func.isRequired, onAccessibility: PropTypes.func.isRequired, accessible: PropTypes.bool.isRequired }
