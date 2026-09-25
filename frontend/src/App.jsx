import usePublicContacts from './usePublicContacts';
import usePublishedContent from "./usePublishedContent";
import Translation from "./i18n/Translation";
import { useLanguage } from "./i18n/LanguageContext";
import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AnimatedNumber from "./AnimatedNumber";
import IdentityCard from "./IdentityCard";
import Apropos from "./pages/Apropos";
import Actualites from "./pages/Actualites";
import Services from "./pages/Services";
import Documents from "./pages/Documents";
import Galerie from "./pages/Galerie";
import Contacts from "./pages/Contacts";
import "./App.css";
import ProvinceMap from "./ProvinceMap";
import Footer from "./Footer";
import "./responsive.css";
import "./polish.css";
import onipLogo from "./assets/logoonip.png";
import onipLoaderCenter from "./assets/onip-loader-center.png";
import onipLoaderRed from "./assets/onip-loader-red.png";
import onipLoaderYellow from "./assets/onip-loader-yellow.png";
import onipLoaderBlue from "./assets/onip-loader-blue.png";
import dgPhoto from "./assets/DG.png";
import IdentificationScenes from "./IdentificationScenes";
import useReveal from "./useReveal";

function Icon({ name, size = 24, ...props }) {
  const paths = {
    arrow: <path d="m9 5 7 7-7 7" />,
    pin: (
      <>
        <path
          fill="currentColor"
          stroke="none"
          d="M12 2a8 8 0 0 0-8 8c0 6 8 13 8 13s8-7 8-13a8 8 0 0 0-8-8Z"
        />
        <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
      </>
    ),
    document: (
      <>
        <path d="M5 2h10l4 4v16H5zM15 2v5h4M8 11h8M8 15h8M8 19h8" />
      </>
    ),
    people: (
      <>
        <circle cx="12" cy="7" r="3" fill="currentColor" />
        <circle cx="4" cy="9" r="2" fill="currentColor" />
        <circle cx="20" cy="9" r="2" fill="currentColor" />
        <path
          fill="currentColor"
          d="M7 21v-3a5 5 0 0 1 10 0v3ZM1 19v-2a4 4 0 0 1 5-4M23 19v-2a4 4 0 0 0-5-4"
        />
      </>
    ),
    headset: (
      <>
        <path d="M3 14v-3a9 9 0 0 1 18 0v6a5 5 0 0 1-5 5h-3" />
        <rect x="1" y="10" width="4" height="9" rx="2" fill="currentColor" />
        <rect x="19" y="10" width="4" height="9" rx="2" fill="currentColor" />
      </>
    ),
    building: (
      <>
        <path d="M3 22h18M6 22V5l6-3 6 3v17M10 22v-5h4v5M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1" />
      </>
    ),
    card: (
      <>
        <rect x="1" y="4" width="22" height="16" rx="2" fill="currentColor" />
        <circle cx="7" cy="10" r="2" fill="white" stroke="none" />
        <path d="M4 16a3 3 0 0 1 6 0" stroke="white" />
        <path d="M14 9h6m-6 4h6m-6 4h4" stroke="white" />
      </>
    ),
    chart: (
      <>
        <path d="M1 22h22" />
        <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
        <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" />
        <rect x="17" y="1" width="4" height="20" rx="1" fill="currentColor" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" fill="currentColor" stroke="none" />
        <path d="M3 22v-3a9 9 0 0 1 18 0v3" fill="currentColor" stroke="none" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.document}
    </svg>
  );
}
Icon.propTypes = { name: PropTypes.string.isRequired, size: PropTypes.number };
function Fingerprint({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 72"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2.7" strokeLinecap="round">
        <path d="M5 30C5 1 50-8 59 23M3 40C16 37 5 16 28 10c18-4 29 10 28 23M8 49c15-5 3-30 23-33 16-3 21 10 18 24-3 15-10 20-17 26M3 57c24-9 10-30 27-35 13-4 17 8 12 22-4 13-13 18-20 21M10 62c18-10 12-24 16-31 4-8 13-4 11 5-2 13-9 21-15 24M30 35c-1 9-4 16-10 20M42 65c10-10 15-23 15-29M4 22C9 9 17 4 27 3M35 3c9 0 17 5 21 12" />
      </g>
      <path d="m33 66 20-16 3 7-17 14Z" fill="#fbd51a" />
      <path d="m42 66 13-9 3 7-6 1-1 7Z" fill="#e51b2b" />
    </svg>
  );
}
Fingerprint.propTypes = { className: PropTypes.string };

function OnipLoader({ leaving }) {
  const { t } = useLanguage();
  return (
    <div
      className={`site-loader ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-label={t("Chargement de la plateforme ONIP")}
    >
      <div className="onip-loader-mark" aria-hidden="true">
        <img className="onip-loader-layer onip-loader-center" src={onipLoaderCenter} alt="" />
        <img className="onip-loader-layer onip-loader-red" src={onipLoaderRed} alt="" />
        <img className="onip-loader-layer onip-loader-yellow" src={onipLoaderYellow} alt="" />
        <img className="onip-loader-layer onip-loader-blue" src={onipLoaderBlue} alt="" />
      </div>
    </div>
  );
}
OnipLoader.propTypes = { leaving: PropTypes.bool.isRequired };


const services = [
  {
    icon: "pin",
    title: "Trouver un centre",
    description: (
      <><Translation text="Localisez le centre d’enrôlement" /><br /><Translation text="le plus proche de vous." /></>
    ),
    body: "Les centres d’enrôlement vous accompagnent dans votre démarche d’identification. La carte et les adresses des centres seront disponibles après connexion au répertoire officiel.",
  },
  {
    icon: "document",
    title: "Suivre ma demande",
    description: (
      <><Translation text="Consultez l’état d’avancement" /><br /><Translation text="de votre demande." /></>
    ),
    body: "Saisissez le numéro figurant sur votre récépissé d’enrôlement.",
  },
  {
    icon: "people",
    title: "Conditions d’enrôlement",
    description: (
      <><Translation text="Découvrez les conditions et les" /><br /><Translation text="pièces à fournir." /></>
    ),
    body: "Préparez les documents attestant votre identité et présentez-vous dans un centre d’enrôlement. La liste officielle des pièces et les conditions d’éligibilité seront publiées ici après validation par l’ONIP.",
  },
  {
    icon: "headset",
    title: "Assistance",
    description: (
      <><Translation text="Besoin d’aide ?" /><br /><Translation text="Nous sommes à votre écoute." /></>
    ),
    body: "Retrouvez les réponses aux questions fréquentes sur l’identification, les centres et le suivi des demandes. Les coordonnées du service d’assistance seront ajoutées après validation.",
  },
];
const leaders = [
  {
    role: "Directeur Général",
    shortRole: "DG",
    name: "MUKOLO BASENGEZI Marcellin",
    photo: dgPhoto,
    scope: "",
    primary: true,
  },
];

const pageRoutes = new Set([
  "/apropos",
  "/actualites",
  "/services",
  "/documents",
  "/galerie",
  "/contacts",
]);

const getPagePath = () => {
  if (typeof window === "undefined") return "/";
  return pageRoutes.has(window.location.pathname) ? window.location.pathname : "/";
};

const LOADER_ANIMATION_DURATION = 3130;
const LOADER_REDUCED_DURATION = 350;
const LOADER_FADE_DURATION = 480;

export default function App() {
  const { t, language, locale } = useLanguage();
  const publicContacts = usePublicContacts();
  const publishedCarousel = usePublishedContent('carousel', 100, true);
  const slides = publishedCarousel.items.map(item => ({ title: item.title[language], text: item.body[language], imageUrl: item.resourceUrl }));
  const publishedNews = usePublishedContent('news', 3);
  const articles = [...publishedNews.items]
    .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))
    .slice(0, 3)
    .map(item => ({
      id: item.id,
      imageUrl: item.resourceUrl,
      category: language === 'fr' ? 'ACTUALITÉ' : 'NEWS',
      date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '',
      title: item.title[language],
      body: item.body[language],
      translations: item,
    }));
  const navigationRef = useRef(null);
  const loaderTimersRef = useRef({ exit: null, remove: null });
  const [slide, setSlide] = useState(0);
  const activeSlide = Math.min(slide, Math.max(0, slides.length - 1));
  const [leavingSlide, setLeavingSlide] = useState(null);
  const [heroPaused, setHeroPaused] = useState(false);
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [accessible, setAccessible] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [loaderCycle, setLoaderCycle] = useState(0);
  const [pagePath, setPagePath] = useState(getPagePath);
  useReveal(pagePath);
  const [navMarker, setNavMarker] = useState({
    left: 0,
    top: 0,
    visible: false,
  });
  const clearLoaderTimers = useCallback(() => {
    window.clearTimeout(loaderTimersRef.current.exit);
    window.clearTimeout(loaderTimersRef.current.remove);
  }, []);
  const finishLoader = useCallback((afterAnimation, { restart = true } = {}) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loaderDuration = reducedMotion
      ? LOADER_REDUCED_DURATION
      : LOADER_ANIMATION_DURATION;

    clearLoaderTimers();
    if (restart) {
      setLoaderCycle((cycle) => cycle + 1);
    }
    setLoaderVisible(true);
    setLoaderLeaving(false);

    loaderTimersRef.current.exit = window.setTimeout(() => {
      afterAnimation?.();
      setLoaderLeaving(true);
      loaderTimersRef.current.remove = window.setTimeout(
        () => setLoaderVisible(false),
        reducedMotion ? 0 : LOADER_FADE_DURATION,
      );
    }, loaderDuration);
  }, [clearLoaderTimers]);
  const commitNavigation = useCallback((path = "/", hash = "", updateHistory = true) => {
    const nextUrl = `${path}${hash ? `#${hash}` : ""}`;
    setPagePath(path);
    setMenu(false);
    setModal(null);
    if (updateHistory) {
      window.history.pushState({}, "", nextUrl);
    }
    window.setTimeout(() => {
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 0);
  }, []);
  const navigate = useCallback((path = "/", hash = "") => {
    const nextPath = pageRoutes.has(path) ? path : "/";
    const currentPath = getPagePath();
    const currentHash = window.location.hash.replace(/^#/, "");

    if (nextPath === currentPath && hash === currentHash) {
      commitNavigation(nextPath, hash, false);
      return;
    }

    setMenu(false);
    setModal(null);
    finishLoader(() => commitNavigation(nextPath, hash));
  }, [commitNavigation, finishLoader]);
  const open = (content) => {
    setNotice("");
    setModal(content);
    setMenu(false);
  };
  const goToSlide = useCallback(
    (next) => {
      if (next === activeSlide) return;
      setLeavingSlide(activeSlide);
      setSlide(next);
    },
    [activeSlide],
  );
  useEffect(() => {
    finishLoader(undefined, { restart: false });
    return clearLoaderTimers;
  }, [clearLoaderTimers, finishLoader]);
  useEffect(() => {
    const onPopState = () => {
      const nextPath = getPagePath();
      const nextHash = window.location.hash.replace(/^#/, "");
      finishLoader(() => commitNavigation(nextPath, nextHash, false));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [commitNavigation, finishLoader]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const dialog = document.querySelector("dialog");
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, [modal]);
  useEffect(() => {
    if (pagePath !== "/" || heroPaused || modal || menu || slides.length < 2) return;
    const timer = window.setInterval(
      () => goToSlide((activeSlide + 1) % slides.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [goToSlide, heroPaused, modal, menu, pagePath, activeSlide, slides.length]);
  useEffect(() => {
    if (leavingSlide === null) return;
    const timer = window.setTimeout(() => setLeavingSlide(null), 450);
    return () => window.clearTimeout(timer);
  }, [leavingSlide]);
  useEffect(() => {
    const updateNavMarker = () => {
      const navigation = navigationRef.current;
      if (!navigation) return;

      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      const activeItem = navigation.querySelector(".active");

      if (!activeItem || isMobile) {
        setNavMarker((current) => ({ ...current, visible: false }));
        return;
      }

      const navigationRect = navigation.getBoundingClientRect();
      const activeRect = activeItem.getBoundingClientRect();
      const markerHeight = 25;
      const markerBottom = 7;
      const markerCenter =
        activeRect.left - navigationRect.left + activeRect.width / 2;

      setNavMarker({
        left: markerCenter,
        top: activeRect.bottom - navigationRect.top - markerHeight - markerBottom,
        visible: true,
      });
    };

    const frame = window.requestAnimationFrame(updateNavMarker);
    window.addEventListener("resize", updateNavMarker);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateNavMarker);
    };
  }, [menu, pagePath, language]);
  const pageViews = {
    "/apropos": <Apropos />,
    "/actualites": <Actualites />,
    "/services": <Services />,
    "/documents": <Documents />,
    "/galerie": <Galerie />,
    "/contacts": <Contacts {...publicContacts} />,
  };
  return (
    <div className={accessible ? "site high-contrast" : "site"}>
      {loaderVisible && <OnipLoader key={loaderCycle} leaving={loaderLeaving} />}
      <a className="skip-link" href="#contenu">{t("Aller au contenu")}</a>
      <header>
        <div className="container header-inner">
          <a
            className="brand"
            href="/"
            aria-label={t("ONIP — Accueil")}
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <img
              className="official-logo"
              src={onipLogo}
              alt="ONIP"
              width="2480"
              height="1155"
            />
            <span className="brand-name">{t("OFFICE NATIONAL")}<br />{t("D’IDENTIFICATION")}<br />{t("DE LA POPULATION")}</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={t("Ouvrir le menu")}
            aria-expanded={menu}
          >
            <Icon name="menu" />
          </button>
          <nav
            ref={navigationRef}
            className={menu ? "navigation is-open" : "navigation"}
            aria-label={t("Navigation principale")}
            style={{
              "--nav-fingerprint-left": `${navMarker.left}px`,
              "--nav-fingerprint-top": `${navMarker.top}px`,
              "--nav-fingerprint-opacity": navMarker.visible ? 1 : 0,
            }}
          >
            <a
              className={pagePath === "/" ? "active" : ""}
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >{t("Accueil")}</a>
            <a
              className={pagePath === "/apropos" ? "active" : ""}
              href="/apropos"
              onClick={(e) => {
                e.preventDefault();
                navigate("/apropos");
              }}
            >{t("À propos")}</a>
            <a
              className={pagePath === "/actualites" ? "active" : ""}
              href="/actualites"
              onClick={(e) => {
                e.preventDefault();
                navigate("/actualites");
              }}
            >{t("Actualités")}</a>
            <a
              className={pagePath === "/services" ? "active" : ""}
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                navigate("/services");
              }}
            >{t("Services")}</a>
            <a
              className={pagePath === "/documents" ? "active" : ""}
              href="/documents"
              onClick={(e) => {
                e.preventDefault();
                navigate("/documents");
              }}
            >{t("Documents")}</a>
            <a
              className={pagePath === "/galerie" ? "active" : ""}
              href="/galerie"
              onClick={(e) => {
                e.preventDefault();
                navigate("/galerie");
              }}
            >{t("Galerie")}</a>
            <a
              className={pagePath === "/contacts" ? "active" : ""}
              href="/contacts"
              onClick={(e) => {
                e.preventDefault();
                navigate("/contacts");
              }}
            >{t("Contacts")}</a>
            <span className="nav-active-fingerprint" aria-hidden="true" />
          </nav>
          <div className="header-actions">
            <button
              className="agent-button"
              onClick={() =>
                open({
                  title: "Pré Enregistrement",
                  body: "Le Pre Enregistrement en ligne vous permettra de préparer votre demande avant de vous rendre dans un centre. Ce service sera disponible prochainement.",
                })
              }
            >
              <Icon name="user" size={21} />{t("Pré-Enregistrement")}</button>
          </div>
        </div>
      </header>
      <main id="contenu">
        {pagePath !== "/" ? (
          pageViews[pagePath]
        ) : (
          <>
        {slides.length > 0 && <section
          className={`hero slide-${activeSlide}`}
          aria-label={t("À la une")}
          onPointerDown={() => setHeroPaused(false)}
          onFocus={(event) => {
            if (event.target.matches(':focus-visible')) setHeroPaused(true);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false);
          }}
        >
          <div className="hero-media" aria-hidden="true">
            {slides.map(({ imageUrl }, index) => (
              <img
                key={`${imageUrl}-${index}`}
                className={`hero-slide-bg ${index === activeSlide ? "is-active" : ""} ${index === leavingSlide ? "is-leaving" : ""}`}
                src={imageUrl}
                alt=""
              />
            ))}
            {slides.map(({ imageUrl }, index) => (
              <img
                key={`print-${imageUrl}-${index}`}
                className={`hero-print-bg ${index === activeSlide ? "is-entering" : ""} ${index === leavingSlide ? "is-exiting" : ""}`}
                src={imageUrl}
                alt=""
              />
            ))}
          </div>
          <div className="hero-shade" />
          <Fingerprint className="hero-fingerprint" />
          <div className="container hero-inner">
            <div className="hero-copy" key={activeSlide}>
              <h1 style={{ whiteSpace: "pre-line" }}>{slides[activeSlide].title}</h1>
              <div className="tricolor hero-line" />
              <p style={{ whiteSpace: "pre-line" }}>{slides[activeSlide].text}</p>
              <div className="motto">{t("IDENTIFIER AUJOURD’HUI")}<br />{t("POUR UN MEILLEUR DEMAIN")}</div>
            </div>
          </div>
          <div className="carousel-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={i === activeSlide ? "selected" : ""}
                onClick={() => goToSlide(i)}
                aria-label={`${t("Afficher la diapositive")} ${i + 1}`}
                aria-pressed={i === activeSlide}
              />
            ))}
          </div>
        </section>}
        <section id="actualites" className="container news">
          <div className="section-heading">
            <div>
              <h2>{t("Dernières actualités")}</h2>
              <div className="tricolor" />
            </div>
            <button
              onClick={() =>
                navigate("/actualites")
              }
            >{t("Voir toutes les actualités")}<span>→</span>
            </button>
          </div>
          {publishedNews.loading && <p role="status">{language === 'fr' ? 'Chargement des actualités…' : 'Loading news…'}</p>}
          {publishedNews.error && <p role="alert">{language === 'fr' ? 'Les actualités sont momentanément indisponibles.' : 'News is temporarily unavailable.'} <button onClick={publishedNews.reload}>{language === 'fr' ? 'Réessayer' : 'Try again'}</button></p>}
          {!publishedNews.loading && !publishedNews.error && !articles.length && <p>{language === 'fr' ? 'Les actualités seront publiées prochainement.' : 'News will be published soon.'}</p>}
          <div className="news-grid">
            {articles.map((article) => (
              <button
                className="news-card"
                key={article.id}
                onClick={() => open(article)}
              >
                {article.imageUrl && <img src={article.imageUrl} alt="" loading="lazy" />}
                <div className="news-copy">
                  <div className="news-meta">
                    <span>{t(article.category)}</span>
                    <time>{t(article.date)}</time>
                  </div>
                  <h3>{t(article.title)}</h3>
                  <span className="read-more">{t("Lire l’article")}<span>→</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section
          id="how-to-identify"
          className="container how-to-identify"
          aria-label={t("Comment se faire identifier")}
        >
          <div className="section-heading">
            <div>
              <h2>{t("Comment se faire identifier")}</h2>
              <div className="tricolor" />
            </div>
          </div>
          <IdentificationScenes />
        </section>
        <section
          id="services"
          className="container services"
          aria-label={t("Vos démarches")}
        >
          {services.map((service) => (
            <button
              className="service-card"
              key={service.title}
              onClick={() => service.icon === "headset" ? navigate("/contacts") : open(service)}
            >
              <span className="service-icon">
                <Icon name={service.icon} size={37} />
              </span>
              <span className="service-copy">
                <strong>{t(service.title)}</strong>
                <span>{service.description}</span>
              </span>
              <Icon name="arrow" className="service-arrow" size={22} />
            </button>
          ))}
        </section>
        <section className="statistics">
          <div className="container statistics-inner">
            <div className="statistics-intro">
              <h2>{t("Nos chiffres clés")}</h2>
              <div className="tricolor" />
              <p>{t("Des avancées concrètes pour une identité")}<br />{t("au service de tous les Congolais.")}</p>
            </div>
            <div className="stat">
              <Icon name="people" size={49} />
              <div>
                <AnimatedNumber value={0} animationValue={34.2} decimals={1} suffix={t(" millions")} />
                <span>{t("de personnes enregistrées")}</span>
              </div>
            </div>
            <div className="stat">
              <Icon name="building" size={47} />
              <div>
                <AnimatedNumber value={0} animationValue={523} delay={120} />
                <span>{t("centres d’enrôlement")}<br />{t("sur toute la RDC")}</span>
              </div>
            </div>
            <div className="stat">
              <Icon name="card" size={46} />
              <div>
                <AnimatedNumber value={0} animationValue={98} suffix="%" delay={240} />
                <span>{t("de demandes traitées")}<br />{t("dans les délais")}</span>
              </div>
            </div>
            <div className="stat">
              <Icon name="chart" size={45} />
              <div>
                <AnimatedNumber value={0} animationValue={26} suffix=" provinces" delay={360} />
                <span>{t("couvertes")}</span>
              </div>
            </div>
          </div>
        </section>
        <ProvinceMap />
        <IdentityCard />
        <section className="management" aria-labelledby="management-title">
          <div className="container">
            <div className="management-showcase">
              <div className="leaders-grid">
                {leaders.map((leader, index) => (
                  <article
                    className={`leader-card ${leader.primary ? "is-primary" : ""}`}
                    key={`${t(leader.role)}-${index}`}
                    style={{ "--leader-delay": `${index * 120}ms` }}
                  >
                    <div
                      className={`leader-avatar ${leader.photo ? "has-photo" : ""}`}
                      aria-hidden="true"
                    >
                      {leader.photo ? (
                        <img src={leader.photo} alt="" />
                      ) : (
                        <>
                          <span>{leader.shortRole}</span>
                          <Icon name="user" size={58} />
                        </>
                      )}
                    </div>
                    <div className="leader-info">
                      <span>{t(leader.role)}</span>
                      <h3>{leader.name}</h3>
                      {leader.scope && <p>{leader.scope}</p>}
                    </div>
                  </article>
                ))}
              </div>
              <aside className="director-quote" aria-label={t("Mot du Directeur Général")}>
                <span>{t("Mot du Directeur Général")}</span>
                <blockquote>{t("« Identifier chaque citoyen, c’est lui garantir une existence administrative, protéger ses droits et ouvrir la voie à des services publics plus justes, fiables et accessibles. »")}</blockquote>
                <p>MUKOLO BASENGEZI Marcellin</p>
                <small>{t("Directeur Général de l’ONIP")}</small>
              </aside>
            </div>
          </div>
        </section>
          </>
        )}
      </main>
      <Footer
        contact={publicContacts.contact}
        onService={(index) => index === 3 ? navigate("/contacts") : open(services[index])}
        onAbout={() => navigate("/apropos")}
        onAccessibility={() => setAccessible(!accessible)}
        accessible={accessible}
      />
      {modal && (
        <dialog
          onCancel={() => setModal(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="dialog-content">
            <button
              className="close-modal"
              aria-label={t("Fermer")}
              onClick={() => setModal(null)}
              autoFocus
            >
              ×
            </button>
            {(modal.image || modal.imageUrl) && (
              <img
                className="article-image"
                src={modal.imageUrl || `/images/${modal.image}.png`}
                alt=""
              />
            )}
            <h2>{modal.translations ? modal.translations.title[language] : t(modal.title)}</h2>
            <div className="tricolor" />
            <p style={{ whiteSpace: "pre-wrap" }}>{modal.translations ? modal.translations.body[language] : t(modal.body)}</p>
            {modal.title === "Suivre ma demande" && (
              <form
                className="tracking"
                onSubmit={(e) => {
                  e.preventDefault();
                  setNotice(
                    "Le suivi en ligne n’est pas encore connecté au service officiel. Aucune demande n’a été transmise.",
                  );
                }}
              >
                <label htmlFor="reference">{t("Numéro de récépissé")}</label>
                <input
                  id="reference"
                  required
                  placeholder={t("Votre numéro de demande")}
                />
                <button className="agent-button">{t("Consulter ma demande")}</button>
                <p role="status">{t(notice)}</p>
              </form>
            )}
            {modal.articles && (
              <div className="result-list">
                {articles.map((article) => (
                  <button key={article.id} onClick={() => open(article)}>
                    {t(article.title)}
                    <Icon name="arrow" size={18} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
}
