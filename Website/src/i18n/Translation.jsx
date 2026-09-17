import PropTypes from 'prop-types'
import { useLanguage } from './LanguageContext'

export default function Translation({ text }) {
  const { t } = useLanguage()
  return t(text)
}
Translation.propTypes = { text: PropTypes.string.isRequired }
