import { useLanguage } from "./i18n/LanguageContext";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import onipLogo from "./assets/logoonip.png";
import specimenPortrait from "./assets/portrait-specimen.png";
import rectoCard from "./assets/recto.png";
import versoCard from "./assets/verso.png";
import "./IdentityCard.css";

function CongoFlag() {
  const { t } = useLanguage();
  return (
    <svg className="identity-flag" viewBox="0 0 120 90" role="img" aria-label={t("Drapeau de la République démocratique du Congo")}>
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
const layerNotes = [
  { id: "face", title: "1. Couche de protection", text: "Film transparent ultra-résistant contre l’usure, les rayures et la falsification." },
  { id: "film", title: "2. Hologramme sécurisé", text: "Élément optique changeant de couleur selon l’angle de vue." },
  { id: "foil", title: "3. Données personnelles", text: "Nom, prénom, date, lieu de naissance, nationalité et numéro d’identification." },
  { id: "national", title: "4. Photo sécurisée", text: "Portrait intégré avec des techniques d’impression de haute sécurité." },
  { id: "heritage", title: "5. Motifs de sécurité", text: "Motifs guillochés, microtextes et trames difficiles à reproduire." },
  { id: "portrait", title: "6. Puce électronique", text: "Zone illustrant le support des données biométriques et personnelles." },
  { id: "data", title: "7. Données biométriques", text: "Empreintes digitales et autres données stockées de manière sécurisée." },
  { id: "core", title: "8. Fond sécurisé", text: "Encres spéciales et éléments visibles selon les contrôles lumineux." },
  { id: "reverse", title: "9. Support principal", text: "Base robuste en polycarbonate conçue pour durer." },
  { id: "finish", title: "10. Couche arrière", text: "Film arrière avec impressions et repères de vérification." },
];
const layerArrowPaths = {
  face: { path: "M70 114 C82 148 60 157 80 183 C100 207 132 176 162 174", end: [162, 174] },
  film: { path: "M213 106 C230 137 204 151 229 175 C245 190 263 189 282 190", end: [282, 190] },
  foil: { path: "M355 116 C337 144 379 158 365 184 C358 197 348 201 346 207", end: [346, 207] },
  national: { path: "M492 106 C470 138 516 160 480 191 C461 207 439 212 428 222", end: [428, 222] },
  heritage: { path: "M628 116 C604 145 662 166 607 202 C566 230 524 221 504 236", end: [504, 236] },
  portrait: { path: "M158 402 C165 372 195 383 218 354 C253 310 505 291 562 273", end: [562, 273] },
  data: { path: "M314 404 C322 372 352 382 382 350 C421 309 590 309 648 286", end: [648, 286] },
  core: { path: "M474 402 C482 373 510 381 540 349 C574 312 690 317 736 300", end: [736, 300] },
  reverse: { path: "M630 404 C634 374 665 382 697 350 C730 317 790 330 816 312", end: [816, 312] },
  finish: { path: "M786 402 C788 373 820 379 847 351 C873 325 903 341 916 328", end: [916, 328] },
};

function LayerArtwork({ kind }) {
  const { t } = useLanguage();
  return (
    <>
      <HeritagePattern />
      <span className="identity-material-heading"><img src={onipLogo} alt="" /><span>{t("ONIP · SPÉCIMEN")}</span></span>
      <span className="identity-material-detail">
        {kind === "portrait" ? <img className="identity-material-portrait" src={specimenPortrait} alt="" /> :
          kind === "national" ? <CongoFlag /> :
          kind === "foil" ? <span className="identity-material-foil">CD</span> :
          kind === "data" ? <span className="identity-material-data">BAKOLE<br />BAKOLE<br />Jacques</span> :
          kind === "reverse" ? <span className="identity-material-mrz">{t("DÉMO")}<br />««««<br />««««</span> :
          kind === "core" ? <svg className="identity-material-circuit" viewBox="0 0 100 160" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="82" height="142" rx="16" /><rect x="17" y="17" width="66" height="126" rx="12" /><rect x="25" y="25" width="50" height="110" rx="8" /><path d="M25 75h24m-24 10h24M49 65h26M49 95h26" /><rect x="36" y="61" width="28" height="38" rx="4" /></g></svg> :
          <span className={`identity-material-pattern pattern-${kind}`} />}
      </span>
      <span className="identity-material-footer">{t("SPÉCIMEN — NON VALABLE")}</span>
    </>
  );
}
LayerArtwork.propTypes = { kind: PropTypes.string.isRequired };

function LayerAnnotations({ visible }) {
  const { t } = useLanguage();
  return (
    <span className="identity-layer-annotations" aria-hidden={!visible}>
      <svg className="identity-layer-arrows" viewBox="0 0 1000 520" preserveAspectRatio="none">
        {layerNotes.map((note, index) => (
          <g key={note.id} className="identity-layer-connector-group" style={{ "--arrow-delay": `${520 + index * 55}ms` }}>
            <path
              className="identity-layer-connector"
              d={layerArrowPaths[note.id].path}
              pathLength="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              className="identity-layer-dot"
              cx={layerArrowPaths[note.id].end[0]}
              cy={layerArrowPaths[note.id].end[1]}
              r="3"
            />
          </g>
        ))}
      </svg>
      {layerNotes.map((note, index) => (
        <span key={note.id} className={`identity-layer-note note-${note.id}`} style={{ "--note-delay": `${610 + index * 50}ms` }}>
          <b>{t(note.title)}</b>
          <small>{t(note.text)}</small>
        </span>
      ))}
    </span>
  );
}
LayerAnnotations.propTypes = { visible: PropTypes.bool.isRequired };

export default function IdentityCard() {
  const { t } = useLanguage();
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
    <section className="identity-showcase" aria-label={t("Carte d’identité de démonstration")}>
      <div className="container identity-layout">
        <div ref={preview} className={`identity-preview${expanded ? " is-expanded" : ""}`} style={{ "--layer-count": layers.length }}>
          <button type="button" className={`identity-card-button${flipped ? " is-flipped" : ""}`} onClick={handleClick} onDoubleClick={toggleLayers}
            onKeyDown={event => {
              if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); toggleLayers(); }
              if (event.key === "Escape") { window.clearTimeout(clickTimer.current); setExpanded(false); }
            }}
            aria-label={expanded ? t("Vue pédagogique en 10 couches. Double-cliquer ou appuyer sur Entrée pour refermer.") : t("Carte spécimen. Cliquer pour retourner. Double-cliquer ou Majuscule + Entrée pour découvrir les 10 couches illustratives.")}
            aria-expanded={expanded}>
            <span className="identity-normal-view">
            <span className="identity-card-rotor">
              <span className="identity-face identity-front identity-card-image-face" aria-hidden={flipped}>
                <img className="identity-real-card-image" src={rectoCard} alt={t("Recto de la carte nationale d'identité")} draggable="false" />
              </span>
              <span className="identity-face identity-back identity-card-image-face" aria-hidden={!flipped}>
                <img className="identity-real-card-image" src={versoCard} alt={t("Verso de la carte nationale d'identité")} draggable="false" />
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
            <LayerAnnotations visible={expanded} />
          </button>
        </div>
      </div>
    </section>
  );
}
