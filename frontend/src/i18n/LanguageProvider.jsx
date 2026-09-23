import { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { LanguageContext } from './LanguageContext'

const descriptions = {
  fr: 'Office National d’Identification de la Population — Une identité sécurisée pour chaque Congolais. Centres d’enrôlement, démarches et actualités.',
}

export default function LanguageProvider({ children }) {
  const language = 'fr'
  useEffect(() => {
    document.documentElement.lang = language
    document.querySelector('meta[name="description"]')?.setAttribute('content', descriptions[language])
    try { localStorage.removeItem('onip-language') } catch { /* Storage may be disabled. */ }
  }, [language])
  const value = useMemo(() => ({
    language,
    locale: 'fr-FR',
    setLanguage: () => {},
    t: text => text,
  }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
LanguageProvider.propTypes = { children: PropTypes.node.isRequired }
