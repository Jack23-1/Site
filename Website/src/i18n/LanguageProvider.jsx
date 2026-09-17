import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { LanguageContext } from './LanguageContext'
import english from './en.json'

const descriptions = {
  fr: 'Office National d’Identification de la Population — Une identité sécurisée pour chaque Congolais. Centres d’enrôlement, démarches et actualités.',
  en: 'National Office for Population Identification — A secure identity for every Congolese citizen. Registration centres, applications and news.',
}

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem('onip-language') === 'en' ? 'en' : 'fr' }
    catch { return 'fr' }
  })
  useEffect(() => {
    document.documentElement.lang = language
    document.querySelector('meta[name="description"]')?.setAttribute('content', descriptions[language])
    try { localStorage.setItem('onip-language', language) } catch { /* Storage may be disabled. */ }
  }, [language])
  const value = useMemo(() => ({
    language,
    locale: language === 'en' ? 'en-GB' : 'fr-FR',
    setLanguage: next => { if (next === 'fr' || next === 'en') setLanguage(next) },
    t: text => {
      if (typeof text !== 'string' || language === 'fr') return text
      const key = text.replace(/\s+/g, ' ').trim()
      return english[key] ? text.replace(/\S[\s\S]*\S|\S/, english[key]) : text
    },
  }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
LanguageProvider.propTypes = { children: PropTypes.node.isRequired }
