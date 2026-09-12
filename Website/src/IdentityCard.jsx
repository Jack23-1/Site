import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import onipLogo from "./assets/logoonip.png";
import specimenPortrait from "./assets/portrait-specimen.png";
import "./IdentityCard.css";

function CongoFlag() {
  return (
    <svg className="identity-flag" viewBox="0 0 120 90" role="img" aria-label="Drapeau de la République démocratique du Congo">
      <path fill="#0085ca" d="M0 0h120v90H0z" />
      <path fill="#f9d534" d="M0 72 101 0h19v18L19 90H0Z" />
      <path fill="#ce233b" d="M0 79 110 0h10v11L10 90H0Z" />
      <path fill="#f9d534" d="m24 9 4.5 13.5H43L31.3 31l4.5 13.5L24 36.2l-11.8 8.3L16.7 31 5 22.5h14.5Z" />
    </svg>
  );
}

function HeritagePattern() {
  return (
    <svg className="identity-heritage" viewBox="0 0 600 360" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M340-10c-90 60 90 65 4 122s-155 37-107 111 28 91-69 147M362-10c-90 60 90 65 4 122s-155 37-107 111 28 91-69 147M384-10c-90 60 90 65 4 122s-155 37-107 111 28 91-69 147" />
        <path d="m430 196 36-50 36 50h-20l28 36h-33v29h-22v-29h-33l28-36Zm80-47 26-37 26 37h-14l21 27h-25v22h-16v-22h-25l21-27Z" />
        <path d="m445 295 24-26h44l24 26-46 46Zm0 0h92m-68-26 22 72 22-72m-44 0 22 26 22-26" />
        <circle cx="495" cy="65" r="35" /><circle cx="495" cy="65" r="27" />
      </g>
    </svg>
  );
}

// Nine material illustrations sit behind the original face: ten planes in total.
const layers = ["film", "foil", "national", "heritage", "portrait", "data", "core", "reverse", "finish"];

function LayerArtwork({ kind }) {
  return (
    <>
      <HeritagePattern />
      <span className="identity-material-heading"><img src={onipLogo} alt="" /><span>ONIP · SPÉCIMEN</span></span>
      <span className="identity-material-detail">
        {kind === "portrait" ? <img className="identity-material-portrait" src={specimenPortrait} alt="" /> :
          kind === "national" ? <CongoFlag /> :
          kind === "foil" ? <span className="identity-material-foil">CD</span> :
          kind === "data" ? <span className="identity-material-data">BAKOLE<br />BAKOLE<br />Jacques</span> :
          kind === "reverse" ? <span className="identity-material-mrz">DÉMO<br />««««<br />««««</span> :
          <span className={`identity-material-pattern pattern-${kind}`} />}
      </span>
      <span className="identity-material-footer">SPÉCIMEN — NON VALABLE</span>
    </>
  );
}
LayerArtwork.propTypes = { kind: PropTypes.string.isRequired };

export default function IdentityCard() {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const preview = useRef(null);
  const clickTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(clickTimer.current), []);
  useEffect(() => {
    const element = preview.current;
    const resize = () => {
      const width = element.getBoundingClientRect().width;
      const cardWidth = Math.min(380, width);
      // Keep the same physical card size; only the distance between planes changes.
      const step = Math.min(68, Math.max(42, (width - cardWidth - 12) / layers.length));
      element.style.setProperty("--layer-step", `${step}px`);

    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const toggleLayers = () => {
    window.clearTimeout(clickTimer.current);
    setExpanded(value => !value);
  };

  const handleClick = event => {
    window.clearTimeout(clickTimer.current);
    if (event.detail === 0) {
      if (expanded) setExpanded(false);
      else setFlipped(value => !value);
      return;
    }
    if (event.detail > 1 || expanded) return;
    clickTimer.current = window.setTimeout(() => setFlipped(value => !value), 500);
  };
  return (
    <section className="identity-showcase" aria-label="Carte d’identité de démonstration">
      <div className="container identity-layout">
        <div ref={preview} className={`identity-preview${expanded ? " is-expanded" : ""}`}>
          <button type="button" className={`identity-card-button${flipped ? " is-flipped" : ""}`} onClick={handleClick} onDoubleClick={toggleLayers}
            onKeyDown={event => {
              if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); toggleLayers(); }
              if (event.key === "Escape") { window.clearTimeout(clickTimer.current); setExpanded(false); }
            }}
            aria-label={expanded ? "Vue pédagogique en 10 couches. Double-cliquer ou appuyer sur Entrée pour refermer." : "Carte spécimen. Cliquer pour retourner. Double-cliquer ou Majuscule + Entrée pour découvrir les 10 couches illustratives."}
            aria-expanded={expanded}>
            <span className="identity-normal-view">
            <span className="identity-card-rotor">
              <span className="identity-face identity-front" aria-hidden={flipped}>
                <HeritagePattern />
                <span className="identity-card-heading"><CongoFlag /><span>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO<small>CARTE D’IDENTITÉ · SPÉCIMEN</small></span><img src={onipLogo} alt="ONIP" /></span>
                <span className="identity-card-body">
                  <span className="identity-portrait"><img src={specimenPortrait} alt="Portrait généré d’un homme fictif atteint d’albinisme" loading="lazy" /><small>PORTRAIT FICTIF</small></span>
                  <span className="identity-fields"><span><small>Nom / Surname</small><b>BAKOLE</b></span><span><small>Post-nom / Other name</small><b>BAKOLE</b></span><span><small>Prénom / Given name</small><b>Jacques</b></span><span className="identity-field-pair"><span><small>Nationalité</small><b>Congolaise</b></span><span><small>Référence</small><b>DÉMO</b></span></span></span>
                  <span className="identity-foil" aria-label="Effet irisé décoratif"><span>CD</span><small>SPÉCIMEN</small></span>
                </span>
                <span className="identity-specimen">SPÉCIMEN — NON VALABLE</span>
                <span className="identity-card-bottom">Office National d’Identification de la Population<span>RDC · DÉMONSTRATION</span></span>
              </span>
              <span className="identity-face identity-back" aria-hidden={!flipped}>
                <HeritagePattern />
                <span className="identity-card-heading"><CongoFlag /><span>OFFICE NATIONAL D’IDENTIFICATION<small>DE LA POPULATION</small></span><img src={onipLogo} alt="ONIP" /></span>
                <span className="identity-back-content"><span className="identity-back-mark" aria-hidden="true">CD</span><span><b>Un pays, mille richesses.</b><small>BAKOLE BAKOLE Jacques</small><span className="identity-back-note">Fleuve · Forêts · Patrimoine minéral<br />Peuple · Unité · Travail</span></span></span>
                <span className="identity-specimen">SPÉCIMEN — NON VALABLE</span>
                <span className="identity-demo-zone" aria-label="Zone MRZ illustrative non lisible par machine">
                  <span className="identity-mrz-label">MRZ FICTIVE · NON ENCODÉE</span>
                  <span>{"DEMO«SPECIMEN«NON«VALABLE««««««"}</span>
                  <span>{"EXEMPLE«SANS«DONNEES«OFFICIELLES"}</span>
                  <span>{"BAKOLE«BAKOLE«JACQUES«DEMO«««««"}</span>
                </span>
              </span>
            </span>
            </span>
            <span className="identity-material-stack" aria-hidden="true">
              {layers.map((kind, index) => (
                <span key={kind} className={`identity-material-plane material-${kind}`} style={{
                  "--layer": index + 1,
                  zIndex: layers.length - index,
                }}>
                  <LayerArtwork kind={kind} />
                </span>
              ))}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
