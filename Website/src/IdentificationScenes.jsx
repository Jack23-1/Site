import { useEffect, useRef, useState } from "react";
import scene1 from "./assets/scene 1 .png";
import scene2 from "./assets/scene 2.png";
import scene3 from "./assets/Scene3.png";
import scene4 from "./assets/Scene 4.png";
import scene5 from "./assets/scene 5.png";
import "./IdentificationScenes.css";

const scenes = [scene1, scene2, scene3, scene4, scene5];

export default function IdentificationScenes() {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(root.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => { if (preference.matches) setPlaying(false); };
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", onPreference);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", onPreference);
    };
  }, []);

  useEffect(() => {
    if (!visible || !pageVisible || !playing || active === scenes.length - 1) return;
    const timer = window.setTimeout(() => setActive(index => index + 1), 5000);
    return () => window.clearTimeout(timer);
  }, [active, visible, pageVisible, playing]);

  const select = index => {
    setPlaying(false);
    setActive(index);
  };
  const last = active === scenes.length - 1;

  return (
    <div className="identification-player" ref={root} role="region" aria-roledescription="carrousel" aria-label="Les cinq scènes de l’identification">
      <div className="identification-stage">
        {scenes.map((src, index) => (
          <div key={src} className={`identification-frame ${index === active ? "is-active" : index < active ? "is-past" : "is-next"}`} aria-hidden={index !== active}>
            <img src={src} alt={`Comment se faire identifier — scène ${index + 1}`} />
          </div>
        ))}
      </div>
      <div className="identification-controls">
        <span className="identification-count">Scène {active + 1} <span>/ {scenes.length}</span></span>
        <div className="identification-steps" aria-label="Choisir une scène">
          {scenes.map((_, index) => (
            <button key={index} type="button" onClick={() => select(index)} aria-label={`Afficher la scène ${index + 1}`} aria-current={active === index ? "step" : undefined} className={index <= active ? "is-reached" : ""}><span /></button>
          ))}
        </div>
        <button type="button" className="identification-play" onClick={() => {
          if (last) { setActive(0); setPlaying(true); }
          else setPlaying(value => !value);
        }}>{last ? "Revoir les scènes ↺" : playing ? "Pause Ⅱ" : "Continuer ▷"}</button>
      </div>
    </div>
  );
}
