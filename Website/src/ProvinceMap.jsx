import { useLanguage } from "./i18n/LanguageContext";
import { useState } from 'react'
import paths from './data/province-paths.json'
import './ProvinceMap.css'

// Geographic order of the SVG paths, not the alphabetical hover array of the old site.
const names = ['Kongo-Central', 'Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri', 'Kwango', 'Kinshasa', 'Kasaï-Oriental', 'Kasaï', 'Kwilu', 'Lualaba', 'Kasaï-Central', 'Lomami', 'Maï-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sud-Kivu', 'Sankuru', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa']
// Positions inside the original SVG; compact provinces use offset labels and leader lines.
const labelPositions = [[65,377],[455,70],[228,185],[551,557],[477,473],[581,75],[607,132],[215,435],[75,320],[421,398],[317,337],[226,353],[423,558],[361,434],[456,421],[226,276],[500,312],[328,123],[589,217],[325,62],[568,313],[402,318],[255,79],[574,429],[462,186],[346,209]]
const provinces = names.map((name, index) => ({ name, path: paths[index], position: labelPositions[index], area: Math.round((index === 8 ? 9965 : 28000 + ((index * 37219 + 26131) % 173000)) / 5) * 5, population: 1250000 + ((index * 783113 + 4350000) % 8200000), enrolled: Math.min(460000 + ((index * 472921 + 810000) % 1900000), Math.round((1250000 + ((index * 783113 + 4350000) % 8200000)) * .88)), centers: 12 + ((index * 7) % 43) }))
const alphabetical = [...provinces].sort((a, b) => a.name.localeCompare(b.name, 'fr'))


export default function ProvinceMap() {
  const { t, locale } = useLanguage();
  const number = new Intl.NumberFormat(locale);
  const [selected, setSelected] = useState('Kinshasa')
  const [hovered, setHovered] = useState(null)
  const province = provinces.find(item => item.name === selected)
  const coverage = Math.round(province.enrolled / province.population * 100)
  const choose = name => { setSelected(name); setHovered(null) }
  return <section id="couverture" className="coverage province-dashboard" aria-labelledby="coverage-title">
    <div className="container coverage-inner">
      <div className="coverage-copy">
        <span className="coverage-eyebrow">{t("L’ONIP à travers la RDC")}</span>
        <h2 id="coverage-title">{t("26 provinces.")}<br/>{t("Un même engagement.")}</h2>
        <div className="tricolor"/>
        <p className="coverage-description">{t("Cliquez sur une province pour découvrir ses chiffres clés et le suivi de l’enrôlement.")}</p>
        <div className="province-detail" aria-live="polite" aria-atomic="true">
          <div className="province-detail-heading"><div><span>{t("VUE PROVINCIALE")}</span><h3>{province.name}</h3></div><span className="simulation-badge">{t("Données simulées")}</span></div>
          <div className="province-metrics">
            <div className="province-metric"><span className="metric-symbol" aria-hidden="true">⌗</span><span>{t("Superficie")}</span><strong>{number.format(province.area)} <small>km²</small></strong></div>
            <div className="province-metric"><span className="metric-symbol" aria-hidden="true">♙</span><span>{t("Population")}</span><strong>{number.format(province.population)}</strong><small>{t("habitants · simulation")}</small></div>
            <div className="province-metric enrolled-metric"><span className="metric-symbol" aria-hidden="true">✓</span><span>{t("Personnes enrôlées")}</span><strong>{number.format(province.enrolled)}</strong><small>{t("inscriptions simulées")}</small></div>
            <div className="province-metric"><span className="metric-symbol" aria-hidden="true">⌖</span><span>{t("Centres d’enrôlement")}</span><strong>{province.centers} <small>{t("centres")}</small></strong></div>
          </div>
          <div className="province-progress"><div><span>{t("Taux de couverture")}</span><strong>{coverage}<small> %</small></strong></div><div className="coverage-progress-track" role="progressbar" aria-label={t("Taux de couverture simulé")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={coverage}><span style={{ width: `${coverage}%` }}/></div><p>{t("Part simulée de la population enrôlée")}</p></div>
          <p className="simulation-note">{t("Chiffres fictifs de démonstration, sans valeur officielle.")}</p>
        </div>
      </div>
      <div className="coverage-map-panel">
        <div className="map-caption"><span className="map-caption-dot"/>{t("République Démocratique du Congo")}<span className="map-country-code">26 PROVINCES</span></div>
        <div className="province-map-scroll"><svg className="province-map" viewBox="-8 -8 689 682" xmlns="http://www.w3.org/2000/svg" role="group" aria-label={t("Carte interactive des 26 provinces de la RDC")} onMouseLeave={() => setHovered(null)}>
          {provinces.map(({ name, path }, index) => <path key={name} d={path} className={`province province-piece ${selected === name ? 'is-active' : ''} ${hovered === name ? 'is-hovered' : ''}`} style={{ '--piece-delay': `${index * 82}ms`, '--piece-x': `${((index % 7) - 3) * 44}px`, '--piece-y': `${index % 2 ? 86 : -72}px`, '--piece-r': `${((index % 5) - 2) * 5}deg` }} role="button" tabIndex={0} aria-label={name} aria-pressed={selected === name} onMouseEnter={() => setHovered(name)} onFocus={() => setHovered(name)} onBlur={() => setHovered(null)} onClick={() => choose(name)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(name) } }}><title>{name}</title></path>)}
          <path className="province-label-leader map-label-layer" d="M91 324 132 343M416 396 402 410"/>
          {provinces.map(({ name, position: [x, y] }, index) => { const lines = name.includes('-') ? name.split('-') : [name]; return <text key={name} className={`province-label map-label-layer ${selected === name ? 'is-selected' : ''} ${name === 'Kinshasa' ? 'external-label' : ''}`} style={{ '--label-delay': `${index * 16}ms` }} x={x} y={y - (lines.length - 1) * 6} textAnchor="middle" aria-hidden="true">{lines.map((line, index) => <tspan key={line} x={x} dy={index ? 13 : 0}>{line}</tspan>)}</text> })}
        </svg></div>
        <div className="map-legend"><span><i/>{t("Provinces de la RDC")}</span><span><i/>{selected}</span></div>
        <div className="mobile-province-picker"><label htmlFor="province-select">{t("Sélectionner une province")}</label><select id="province-select" value={selected} onChange={e => choose(e.target.value)}>{alphabetical.map(({ name }) => <option key={name}>{name}</option>)}</select></div>
      </div>
    </div>
  </section>
}
