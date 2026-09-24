import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Admin from './admin/Admin.jsx'
import LanguageProvider from './i18n/LanguageProvider.jsx'
import { staticContentMode } from './contentMode'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>{!staticContentMode && window.location.pathname.replace(/\/$/, '') === '/admin' ? <Admin /> : <App />}</LanguageProvider>
  </StrictMode>,
)
