import { useEffect, useRef, useState } from "react";
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

const cardLayers = [
  { title: "Film de protection", detail: "Surface transparente · illustration", kind: "film" },
  { title: "Finition irisée", detail: "Reflets décoratifs", kind: "iridescent" },
  { title: "Identité nationale", detail: "Drapeau & logo ONIP", kind: "national" },
  { title: "Motifs du patrimoine", detail: "Fleuve, forêts et minerais", kind: "heritage" },
  { title: "Portrait", detail: "Photographie fictive", kind: "portrait" },
  { title: "Données visuelles", detail: "BAKOLE BAKOLE Jacques", kind: "data" },
  { title: "Support de la carte", detail: "Structure illustrative", kind: "core" },
  { title: "Éléments du verso", detail: "Identité & devise", kind: "reverse" },
  { title: "Zone MRZ fictive", detail: "Démonstration non encodée", kind: "mrz" },
  { title: "Protection du verso", detail: "Maquette pédagogique · non valable", kind: "back-film" },
];

export default function IdentityCard() {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const clickTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(clickTimer.current), []);

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
        <div className={`identity-preview${expanded ? " is-expanded" : ""}`}>
          <button type="button" className={`identity-card-button${flipped ? " is-flipped" : ""}`} onClick={handleClick} onDoubleClick={toggleLayers}
            onKeyDown={event => {
              if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); toggleLayers(); }
              if (event.key === "Escape") { window.clearTimeout(clickTimer.current); setExpanded(false); }
            }}
            aria-label={expanded ? "Vue pédagogique en 10 couches. Double-cliquer ou appuyer sur Entrée pour refermer." : "Carte spécimen. Cliquer pour retourner. Double-cliquer ou Majuscule + Entrée pour découvrir les 10 couches illustratives."}
            aria-expanded={expanded} aria-describedby={expanded ? "identity-layer-description" : undefined}>
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
            <span className="identity-layers" aria-hidden={!expanded}>
              {cardLayers.map((layer, index) => (
                <span key={layer.kind} className={`identity-layer layer-${layer.kind}`} style={{ "--layer-index": index }}>
                  <span className="identity-layer-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="identity-layer-caption"><b>{layer.title}</b><small>{layer.detail}</small></span>
                  <span className="identity-layer-art" aria-hidden="true">
                    {layer.kind === "national" ? <><CongoFlag /><img src={onipLogo} alt="" /></> :
                      layer.kind === "portrait" ? <img className="layer-photo" src={specimenPortrait} alt="" /> :
                      layer.kind === "heritage" ? <HeritagePattern /> :
                      layer.kind === "data" ? <span className="layer-data-lines">BAKOLE<br />BAKOLE Jacques</span> :
                      layer.kind === "mrz" ? <span className="layer-mrz-lines">DEMO«SPECIMEN<br />NON«VALABLE««</span> :
                      layer.kind === "reverse" ? <span className="layer-reverse-mark">CD</span> :
                      <span className="layer-material" />}
                  </span>
                </span>
              ))}
            </span>
          </button>
          {expanded && <span id="identity-layer-description" className="identity-layer-description">Composition visuelle illustrative, sans reproduction de la structure technique d’un document officiel.</span>}
        </div>
      </div>
    </section>
  );
}
