import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import onipLogo from "./assets/logoonip.png";
import specimenPortrait from "./assets/portrait-specimen.png";
import rectoCard from "./assets/recto.png";
import versoCard from "./assets/verso.png";
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
          kind === "core" ? <svg className="identity-material-circuit" viewBox="0 0 100 160" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="82" height="142" rx="16" /><rect x="17" y="17" width="66" height="126" rx="12" /><rect x="25" y="25" width="50" height="110" rx="8" /><path d="M25 75h24m-24 10h24M49 65h26M49 95h26" /><rect x="36" y="61" width="28" height="38" rx="4" /></g></svg> :
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
      const step = Math.min(64, Math.max(48, (width - cardWidth - 40) / layers.length));
      element.style.setProperty("--layer-step", `${step}px`);
      element.style.setProperty("--stack-extra", `${layers.length * step + 140}px`);
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
        <div ref={preview} className={`identity-preview${expanded ? " is-expanded" : ""}`} style={{ "--layer-count": layers.length }}>
          <button type="button" className={`identity-card-button${flipped ? " is-flipped" : ""}`} onClick={handleClick} onDoubleClick={toggleLayers}
            onKeyDown={event => {
              if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); toggleLayers(); }
              if (event.key === "Escape") { window.clearTimeout(clickTimer.current); setExpanded(false); }
            }}
            aria-label={expanded ? "Vue pédagogique en 10 couches. Double-cliquer ou appuyer sur Entrée pour refermer." : "Carte spécimen. Cliquer pour retourner. Double-cliquer ou Majuscule + Entrée pour découvrir les 10 couches illustratives."}
            aria-expanded={expanded}>
            <span className="identity-normal-view">
            <span className="identity-card-rotor">
              <span className="identity-face identity-front identity-card-image-face" aria-hidden={flipped}>
                <img className="identity-real-card-image" src={rectoCard} alt="Recto de la carte nationale d'identité" draggable="false" />
              </span>
              <span className="identity-face identity-back identity-card-image-face" aria-hidden={!flipped}>
                <img className="identity-real-card-image" src={versoCard} alt="Verso de la carte nationale d'identité" draggable="false" />
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
