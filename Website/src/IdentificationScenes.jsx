import { useLanguage } from "./i18n/LanguageContext";
import { useEffect, useRef, useState } from "react";
import scene1 from "./assets/scene 1 .png";
import scene2 from "./assets/scene 2.png";
import scene3 from "./assets/Scene3.png";
import scene4 from "./assets/Scene 4.png";
import scene5 from "./assets/scene 5.png";
import "./IdentificationScenes.css";

const scenes = [scene1, scene2, scene3, scene4, scene5];

export default function IdentificationScenes() {
  const { t } = useLanguage();
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [complete, setComplete] = useState(false);
  const [replay, setReplay] = useState(0);
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setStarted(true);
    }, { threshold: 0.35 });
    observer.observe(root.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => {
      if (preference.matches) { setPlaying(false); setComplete(true); setActive(scenes.length - 1); }
    };
    onPreference();
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", onPreference);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", onPreference);
    };
  }, []);

  const select = index => {
    setPlaying(false);
    setActive(index);
    setComplete(true);
  };
  const last = active === scenes.length - 1 && complete;
  const running = visible && pageVisible && playing;


  return (
    <div className="identification-player" ref={root} role="region" aria-label={t("Les cinq scènes de l’identification")}>
      <div className={`identification-stage${last ? " is-complete" : ""}`} tabIndex={0} role="group" aria-label={t("Scènes dans l’ordre")}>
        {scenes.map((src, index) => (
          <div key={`${src}-${replay}`} style={{ "--slot": index, animationPlayState: running ? "running" : "paused" }}
            className={`identification-frame ${index < active || (complete && index === active) ? "is-settled" : started && index === active ? "is-entering" : "is-next"}`}
            aria-hidden={!started || index > active}
            onAnimationEnd={event => {
              if (event.target !== event.currentTarget || index !== active) return;
              if (index < scenes.length - 1) setActive(value => value + 1);
              else setComplete(true);
            }}>
            <img src={src} alt={`${t("Comment se faire identifier — scène")} ${index + 1}`} />
          </div>
        ))}
      </div>
      <div className="identification-controls">
        <span className="identification-count">{t("Scène ")}{active + 1} <span>/ {scenes.length}</span></span>
        <div className="identification-steps" aria-label={t("Choisir une scène")}>
          {scenes.map((_, index) => (
            <button key={index} type="button" onClick={() => select(index)} aria-label={`${t("Afficher les scènes 1 à")} ${index + 1}`} aria-current={active === index ? "step" : undefined} className={index <= active ? "is-reached" : ""}><span /></button>
          ))}
        </div>
        <button type="button" className="identification-play" onClick={() => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setActive(scenes.length - 1); setComplete(true); return; }
          if (last) { setActive(0); setComplete(false); setReplay(value => value + 1); setPlaying(true); }
          else {
            if (complete) { setActive(value => Math.min(value + 1, scenes.length - 1)); setComplete(false); }
            setPlaying(value => !value);
          }
        }}>{last ? t("Revoir les scènes ↺") : playing ? t("Pause Ⅱ") : t("Continuer ▷")}</button>
      </div>
    </div>
  );
}
