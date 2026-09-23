import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import 'dotenv/config'
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'
import { createDatabase } from '../server/db.mjs'
import { hashPassword } from '../server/password.mjs'

if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL est requis.')
const require = createRequire(import.meta.url)
const schema = `browser_${randomBytes(10).toString('hex')}`
const url = new URL(process.env.TEST_DATABASE_URL)
url.searchParams.set('schema', schema)
const databaseUrl = url.toString()
const db = createDatabase(databaseUrl)
const origin = 'http://localhost:5174'
const children = []
let browser
const password = randomBytes(24).toString('base64url')
const email = 'browser-test@example.org'
const errors = []
async function ready(address) {
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(address)).ok) return } catch { /* Server is starting. */ }
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  throw new Error(`Le serveur de test n’a pas démarré : ${address}`)
}
function start(args, env, cwd = process.cwd()) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.resume(); child.stderr.resume()
  children.push(child)
}
try {
  execFileSync(process.execPath, [require.resolve('prisma/package.json').replace(/package\.json$/, 'build/index.js'), 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: databaseUrl }, stdio: 'pipe' })
  await db.adminUser.create({ data: { email, name: 'Administrateur de test', passwordHash: await hashPassword(password) } })
  start(['server/index.mjs'], { DATABASE_URL: databaseUrl, APP_ORIGIN: origin, PORT: '3002', NODE_ENV: 'test' })
  start([fileURLToPath(new URL('./bin/vite.js', pathToFileURL(createRequire(new URL('../../frontend/package.json', import.meta.url)).resolve('vite/package.json')))), '--port', '5174'], { API_PROXY_TARGET: 'http://127.0.0.1:3002', NODE_ENV: 'development' }, fileURLToPath(new URL('../../frontend/', import.meta.url)))
  await Promise.all([ready('http://127.0.0.1:3002/api/health'), ready(origin)])
  for (const path of ['/.env', '/.local-postgres/postgres.log', '/.local-postgres/data/pg_hba.conf']) {
    assert.equal((await fetch(`${origin}/@fs${fileURLToPath(new URL('..', import.meta.url))}${path}`)).status, 403, `Private file must be blocked: ${path}`)
  }
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' })
  await context.route('https://example.org/test.png', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#dceaf7"/></svg>' }))
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await mkdir('test-results', { recursive: true })
  await page.goto(`${origin}/admin`)
  await expect(page.getByRole('heading', { name: 'Bienvenue.' })).toBeVisible()
  await page.screenshot({ path: 'test-results/admin-login-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/admin-login-mobile.png', fullPage: true })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Login overflow on mobile')
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.getByLabel('Adresse e-mail').fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Afficher le mot de passe', exact: true }).click()
  await expect(page.getByLabel('Mot de passe', { exact: true })).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Masquer le mot de passe', exact: true }).click()
  await expect(page.getByLabel('Mot de passe', { exact: true })).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('heading', { name: 'Actualités', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Vos contenus commencent ici.' })).toBeVisible()
  await page.getByRole('button', { name: 'Nouveau contenu' }).click()
  await page.getByLabel('Titre · FR', { exact: true }).fill('Actualité de vérification')
  await page.getByLabel('Article · FR', { exact: true }).fill('Texte français conservé dans PostgreSQL.')
  await page.getByRole('button', { name: 'English' }).click()
  await page.getByLabel('Titre · EN', { exact: true }).fill('Verification news')
  await page.getByLabel('Article · EN', { exact: true }).fill('English text stored in PostgreSQL.')
  await page.getByRole('button', { name: 'Enregistrer le brouillon' }).click()
  await expect(page.getByRole('status')).toHaveText('Le brouillon a été enregistré.')
  const publicPage = await context.newPage()
  await publicPage.goto(`${origin}/actualites`)
  await expect(publicPage.getByText('Les contenus seront disponibles prochainement.')).toBeVisible()
  await page.getByRole('button', { name: /Actualité de vérification/ }).click()
  await expect(page.getByLabel('Titre · FR', { exact: true })).toHaveValue('Actualité de vérification')
  await page.getByLabel('Visibilité').selectOption('published')
  await page.getByRole('button', { name: 'Enregistrer et publier' }).click()
  await expect(page.getByRole('status')).toHaveText('Le contenu a été publié.')
  await page.reload()
  await expect(page.getByRole('button', { name: /Actualité de vérification/ })).toBeVisible()
  await page.screenshot({ path: 'test-results/admin-desktop.png', fullPage: true })
  await publicPage.reload()
  await expect(publicPage.getByRole('heading', { name: 'Actualité de vérification' })).toBeVisible()
  await publicPage.getByRole('button', { name: 'English', exact: true }).click()
  await expect(publicPage.getByRole('heading', { name: 'Verification news' })).toBeVisible()
  await publicPage.getByText('Read article', { exact: true }).click()
  await expect(publicPage.getByText('English text stored in PostgreSQL.')).toBeVisible()
  await publicPage.reload()
  await expect(publicPage.getByRole('heading', { name: 'Verification news' })).toBeVisible()
  await publicPage.goto(origin)
  await expect(publicPage.getByRole('heading', { name: 'Verification news' })).toBeVisible()
  for (const [section, fr, en, resource] of [
    ['Documents', 'Document de vérification', 'Verification document', 'https://example.org/document.pdf'],
    ['Galerie', 'Photo de vérification', 'Verification photo', 'https://example.org/test.png'],
  ]) {
    await page.getByRole('button', { name: new RegExp(section) }).first().click()
    await page.getByRole('button', { name: 'Nouveau contenu' }).click()
    await page.getByLabel('Titre · FR', { exact: true }).fill(fr)
    await page.getByRole('button', { name: 'English' }).click()
    await page.getByLabel('Titre · EN', { exact: true }).fill(en)
    await page.getByLabel(/Lien .*HTTPS/).fill(resource)
    await page.getByLabel('Visibilité').selectOption('published')
    await page.getByRole('button', { name: 'Enregistrer et publier' }).click()
    await expect(page.getByRole('status')).toHaveText('Le contenu a été publié.')
    await publicPage.goto(`${origin}/${section === 'Documents' ? 'documents' : 'galerie'}`)
    await expect(publicPage.getByRole('heading', { name: en })).toBeVisible()
  }
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Admin overflow at ${width}px`)
    await publicPage.setViewportSize({ width, height: 900 })
    assert.ok(await publicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Public overflow at ${width}px`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/admin-mobile.png', fullPage: true })
  await page.getByRole('button', { name: /Photo de vérification/ }).click()
  await page.screenshot({ path: 'test-results/admin-editor-mobile.png', fullPage: true })
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Le contenu a été supprimé.')
  await publicPage.reload()
  await expect(publicPage.getByText('Content will be available soon.')).toBeVisible()
  // Keep a separate visitor session open: carousel changes must appear without reloading.
  const visitor = await browser.newContext()
  const home = await visitor.newPage()
  await home.goto(origin)
  await expect(home.locator('.hero')).toHaveCount(0)
  await page.getByRole('button', { name: /Carrousel/ }).first().click()
  await page.getByRole('button', { name: 'Ajouter une photo au carrousel' }).click()
  await expect(page.getByRole('group', { name: 'Langue du contenu' })).toHaveCount(0)
  await expect(page.getByLabel('Visibilité')).toHaveCount(0)
  await expect(page.getByLabel('Ordre d’affichage')).toHaveCount(0)
  await expect(page.getByLabel('Lien de l’image (HTTPS)')).toHaveCount(0)
  await page.getByLabel('Texte de la photo').fill('Photo carrousel en direct\nTexte accompagnant la photo.')
  await page.locator('input[type=file]').setInputFiles({ name: 'first.png', mimeType: 'image/png', buffer: await (await import('sharp')).default({ create: { width: 64, height: 64, channels: 3, background: '#225599' } }).png().toBuffer() })
  await expect(page.getByAltText('Aperçu de la photo sélectionnée')).toHaveAttribute('src', /\/api\/media\//)
  const firstPhoto = await page.getByAltText('Aperçu de la photo sélectionnée').getAttribute('src')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(home.locator('.hero-slide-bg')).toHaveAttribute('src', firstPhoto)
  await expect.poll(() => home.locator('.hero-slide-bg').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true)
  await expect(home.locator('.hero h1')).toHaveText('Photo carrousel en direct')
  await expect(home.locator('.hero-copy p')).toHaveText('Texte accompagnant la photo.')
  await page.getByRole('button', { name: /Photo carrousel en direct/ }).click()
  await page.locator('input[type=file]').setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: await (await import('sharp')).default({ create: { width: 64, height: 64, channels: 3, background: '#225599' } }).png().toBuffer() })
  await expect(page.getByAltText('Aperçu de la photo sélectionnée')).toHaveAttribute('src', /\/api\/media\//)
  await expect(page.getByText('replacement.png', { exact: true })).toBeVisible()
  const replacement = await page.getByAltText('Aperçu de la photo sélectionnée').getAttribute('src')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(home.locator('.hero-slide-bg')).toHaveAttribute('src', replacement)
  // Adding a second photo keeps the first slide and appends the new one.
  await page.getByRole('button', { name: 'Ajouter une photo au carrousel' }).click()
  await expect(page.getByRole('heading', { name: 'Nouvelle photo du carrousel' })).toBeVisible()
  await page.getByLabel('Texte de la photo').fill('Deuxième photo ajoutée')
  await page.locator('input[type=file]').setInputFiles({ name: 'additional.png', mimeType: 'image/png', buffer: await (await import('sharp')).default({ create: { width: 64, height: 64, channels: 3, background: '#994422' } }).png().toBuffer() })
  await expect(page.getByAltText('Aperçu de la photo sélectionnée')).toHaveAttribute('src', /\/api\/media\//)
  const addedPhoto = await page.getByAltText('Aperçu de la photo sélectionnée').getAttribute('src')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(home.locator('.hero-slide-bg')).toHaveCount(2)
  await expect(home.locator('.hero-slide-bg').first()).toHaveAttribute('src', replacement)
  await expect(home.locator('.hero-slide-bg').nth(1)).toHaveAttribute('src', addedPhoto)
  await page.getByRole('button', { name: /Deuxième photo ajoutée/ }).click()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await expect(home.locator('.hero-slide-bg')).toHaveCount(1)
  await page.getByRole('button', { name: /Photo carrousel en direct/ }).click()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await expect(home.locator('.hero')).toHaveCount(0)
  await home.reload()
  await expect(home.locator('.hero')).toHaveCount(0)
  // A stationary pointer and a clicked navigation dot must not stop autoplay.
  await home.route('**/api/content?type=carousel&*', route => route.fulfill({ json: {
    items: [0, 1].map(index => ({ id: `autoplay-${index}`, title: { fr: `Diapositive ${index}`, en: `Slide ${index}` }, body: { fr: '', en: '' }, resourceUrl: index ? '/images/center.png' : '/images/hero.png' })), nextCursor: null,
  } }))
  await home.reload()
  await expect(home.locator('.hero-slide-bg')).toHaveCount(2)
  await home.locator('.hero').hover()
  await home.locator('.carousel-dots button').first().click()
  await expect(home.locator('.carousel-dots button').nth(1)).toHaveAttribute('aria-pressed', 'true', { timeout: 8500 })
  await home.locator('.carousel-dots button').first().click()
  await home.locator('.hero').hover()
  await expect(home.locator('.carousel-dots button').nth(1)).toHaveAttribute('aria-pressed', 'true', { timeout: 8500 })
  await visitor.close()
  await page.getByRole('button', { name: 'Se déconnecter' }).click()
  await expect(page.getByRole('heading', { name: 'Bienvenue.' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bienvenue.' })).toBeVisible()
  assert.deepEqual(errors, [])
  console.log('Browser checks passed: login, draft/publish, persistence, FR/EN, documents, gallery, deletion, logout and responsive widths.')
} finally {
  await browser?.close()
  await Promise.all(children.map(child => new Promise(resolve => {
    if (child.exitCode !== null) return resolve()
    child.once('exit', resolve); child.kill('SIGTERM')
    const timeout = setTimeout(() => child.kill('SIGKILL'), 5000); timeout.unref()
  })))
  if (/^browser_[a-f0-9]{20}$/.test(schema)) await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
  await db.$disconnect()
}
