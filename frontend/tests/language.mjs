import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  globalThis.window = { location: { pathname: '/' }, matchMedia: () => ({ matches: true }) }
  globalThis.document = { hidden: false }
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  const { default: Provider } = await server.ssrLoadModule('/src/i18n/LanguageProvider.jsx')
  const { useLanguage } = await server.ssrLoadModule('/src/i18n/LanguageContext.js')
  let context
  function Probe() { context = useLanguage(); return null }
  function render(language) {
    globalThis.localStorage = { getItem: () => language }
    return renderToStaticMarkup(React.createElement(Provider, null, React.createElement(Probe), React.createElement(App)))
  }
  const fr = render('fr')
  assert.match(fr, /Dernières actualités/)
  const en = render('en')
  for (const text of ['Latest news', 'Registration requirements', 'Simulated data', 'Protective layer', 'Main navigation', 'Pre-registration']) assert.ok(en.includes(text), text)
  assert.ok(!en.includes('Dernières actualités'))
  assert.equal(context.t(' millions'), ' million')
  assert.equal(context.t('Suivre ma demande'), 'Track my application')
  assert.equal(context.t('Unknown name'), 'Unknown name')
  assert.equal(context.locale, 'en-GB')
  for (const route of ['/apropos', '/actualites', '/services', '/documents', '/galerie', '/contacts']) {
    window.location.pathname = route
    assert.match(render('en'), /Main navigation/)
  }
  window.location.pathname = '/'
  assert.match(render('invalid'), /Dernières actualités/)
  globalThis.localStorage = { getItem: () => { throw Error('Storage disabled') } }
  assert.match(renderToStaticMarkup(React.createElement(Provider, null, React.createElement(App))), /Dernières actualités/)
  console.log('Language checks passed: FR/EN rendering, all routes, translations, locale and storage fallback.')
} finally { await server.close() }
