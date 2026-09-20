import { createRequire } from 'node:module'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import 'dotenv/config'
import assert from 'node:assert/strict'
import { before, beforeEach, after, test } from 'node:test'
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import request from 'supertest'
import { createApp } from '../server/app.mjs'
import { createDatabase } from '../server/db.mjs'
import { hashPassword } from '../server/password.mjs'

if (!process.env.TEST_DATABASE_URL) throw new Error('Configurez TEST_DATABASE_URL avec une base PostgreSQL dédiée aux tests.')
const require = createRequire(import.meta.url)
const schema = `test_${randomBytes(10).toString('hex')}`
const url = new URL(process.env.TEST_DATABASE_URL)
url.searchParams.set('schema', schema)
const databaseUrl = url.toString()
const origin = 'http://localhost:5173'
const password = 'A-strong-test-password-42!'
const email = 'test-admin@example.org'
const db = createDatabase(databaseUrl)
let app, passwordHash
const mediaDirectory = await mkdtemp(path.join(tmpdir(), 'onip-api-media-'))
const draft = (type = 'news') => ({ type, status: 'draft', title: { fr: 'Titre français', en: 'English title' }, body: { fr: 'Texte français', en: 'English text' }, resourceUrl: type === 'news' ? '' : 'https://example.org/file.pdf' })
const login = async (client = request(app)) => {
  const response = await client.post('/api/admin/login').set('Origin', origin).send({ email, password }).expect(200)
  return { cookie: response.headers['set-cookie'][0].split(';')[0], csrf: response.body.csrfToken, response }
}
const mutate = (auth, method, path) => request(app)[method](path).set('Origin', origin).set('Cookie', auth.cookie).set('X-CSRF-Token', auth.csrf)

before(async () => {
  try { execFileSync(process.execPath, [require.resolve('prisma/package.json').replace(/package\.json$/, 'build/index.js'), 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: databaseUrl }, stdio: 'pipe' }) }
  catch { throw new Error('Impossible de migrer le schéma de test. Vérifiez le serveur et TEST_DATABASE_URL.') }
  await db.$connect()
  passwordHash = await hashPassword(password)
})
beforeEach(async () => {
  await db.session.deleteMany()
  await db.adminUser.deleteMany()
  await db.content.deleteMany()
  await db.media.deleteMany()
  await db.siteContact.deleteMany()
  await db.adminUser.create({ data: { email, name: 'Test admin', passwordHash } })
  app = await createApp({ db, origin, mediaDirectory })
})
after(async () => {
  // Only the random schema created by this test process is removed.
  if (/^test_[a-f0-9]{20}$/.test(schema)) await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
  await db.$disconnect()
  await rm(mediaDirectory, { recursive: true, force: true })
})

test('admin routes deny anonymous requests', async () => {
  await request(app).get('/api/admin/session').expect(401)
  await request(app).get('/api/admin/content?type=news').expect(401)
  await request(app).post('/api/admin/content').set('Origin', origin).send(draft()).expect(401)
})
test('login validates origin and credentials, then stores a hashed session token', async () => {
  await request(app).post('/api/admin/login').set('Origin', 'https://untrusted.example').send({ email, password }).expect(403)
  await request(app).post('/api/admin/login').set('Origin', origin).send({ email, password: 'wrong' }).expect(401)
  await request(app).post('/api/admin/login').set('Origin', origin).send({ email: 'not-email', password }).expect(400)
  const auth = await login()
  assert.match(auth.response.headers['set-cookie'][0], /HttpOnly/)
  assert.match(auth.response.headers['set-cookie'][0], /SameSite=Strict/)
  assert.equal(auth.response.body.user.email, email)
  assert.equal(auth.response.body.user.passwordHash, undefined)
  const sessions = await db.session.findMany()
  assert.equal(sessions.length, 1)
  assert.notEqual(sessions[0].tokenHash, auth.cookie.split('=')[1])
  assert.ok(sessions[0].expiresAt > new Date())
  await request(app).get('/api/admin/session').set('Cookie', auth.cookie).expect(200)
})
test('mutations reject missing, malformed and cross-origin CSRF credentials', async () => {
  const auth = await login()
  await request(app).post('/api/admin/content').set('Origin', origin).set('Cookie', auth.cookie).send(draft()).expect(403)
  await request(app).post('/api/admin/content').set('Origin', origin).set('Cookie', auth.cookie).set('X-CSRF-Token', 'é'.repeat(64)).send(draft()).expect(403)
  await request(app).post('/api/admin/content').set('Origin', 'https://untrusted.example').set('Cookie', auth.cookie).set('X-CSRF-Token', auth.csrf).send(draft()).expect(403)
  assert.equal(await db.content.count(), 0)
})
test('bilingual content lifecycle: draft, publish, conflict, unpublish, delete', async () => {
  const auth = await login()
  const created = await mutate(auth, 'post', '/api/admin/content').send(draft()).expect(201)
  const item = created.body.item
  assert.equal(item.title.en, 'English title')
  assert.equal(item.version, 1)
  assert.equal((await request(app).get('/api/content?type=news').expect(200)).body.items.length, 0)
  const published = await mutate(auth, 'put', `/api/admin/content/${item.id}`).send({ ...item, status: 'published' }).expect(200)
  assert.equal(published.body.item.version, 2)
  assert.ok(published.body.item.publishedAt)
  const feed = await request(app).get('/api/content?type=news').expect(200)
  assert.equal(feed.body.items[0].body.fr, 'Texte français')
  await mutate(auth, 'put', `/api/admin/content/${item.id}`).send(item).expect(409)
  await mutate(auth, 'delete', `/api/admin/content/${item.id}`).send({ version: 1 }).expect(409)
  const unpublished = await mutate(auth, 'put', `/api/admin/content/${item.id}`).send({ ...published.body.item, status: 'draft' }).expect(200)
  assert.equal((await request(app).get('/api/content?type=news')).body.items.length, 0)
  await mutate(auth, 'delete', `/api/admin/content/${item.id}`).send({ version: unpublished.body.item.version }).expect(200)
  assert.equal(await db.content.count(), 0)
})
test('server validates bilingual fields, links, identifiers and immutable type', async () => {
  const auth = await login()
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft(), title: { fr: 'Seulement français', en: '' } }).expect(400)
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft('documents'), resourceUrl: 'javascript:alert(1)' }).expect(400)
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft('gallery'), resourceUrl: '' }).expect(400)
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft(), status: 'published', body: { fr: 'Texte', en: '' } }).expect(400)
  await mutate(auth, 'put', '/api/admin/content/invalid-id').send({ ...draft(), version: 1 }).expect(400)
  const { body } = await mutate(auth, 'post', '/api/admin/content').send(draft()).expect(201)
  await mutate(auth, 'put', `/api/admin/content/${body.item.id}`).send({ ...body.item, type: 'documents', resourceUrl: 'https://example.org/file.pdf' }).expect(400)
})
test('public API paginates published contents and separates types', async () => {
  const auth = await login()
  for (let i = 0; i < 3; i++) await mutate(auth, 'post', '/api/admin/content').send({ ...draft(), status: 'published' }).expect(201)
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft('documents'), status: 'published' }).expect(201)
  await mutate(auth, 'post', '/api/admin/content').send(draft()).expect(201)
  const first = (await request(app).get('/api/content?type=news&limit=2').expect(200)).body
  assert.equal(first.items.length, 2)
  assert.ok(first.nextCursor)
  const second = (await request(app).get(`/api/content?type=news&limit=2&cursor=${first.nextCursor}`).expect(200)).body
  assert.equal(second.items.length, 1)
  assert.equal(second.nextCursor, null)
  assert.ok(!first.items.some(item => item.id === second.items[0].id))
  assert.equal((await request(app).get('/api/content?type=documents')).body.items.length, 1)
  await request(app).get('/api/content?type=users').expect(400)
})
test('logout revokes sessions, expired and inactive sessions cannot authenticate', async () => {
  const auth = await login()
  await mutate(auth, 'post', '/api/admin/logout').send({}).expect(200)
  await request(app).get('/api/admin/session').set('Cookie', auth.cookie).expect(401)
  const second = await login()
  await db.session.updateMany({ data: { expiresAt: new Date(0) } })
  await request(app).get('/api/admin/session').set('Cookie', second.cookie).expect(401)
  const third = await login()
  await db.adminUser.update({ where: { email }, data: { active: false } })
  await request(app).get('/api/admin/session').set('Cookie', third.cookie).expect(401)
})
test('login attempts are rate limited', async () => {
  for (let i = 0; i < 8; i++) await request(app).post('/api/admin/login').set('Origin', origin).send({ email, password: 'wrong' }).expect(401)
  await request(app).post('/api/admin/login').set('Origin', origin).send({ email, password: 'wrong' }).expect(429)
})
test('saved data survives a new Prisma connection', async () => {
  const auth = await login()
  const created = await mutate(auth, 'post', '/api/admin/content').send(draft('gallery')).expect(201)
  const secondDb = createDatabase(databaseUrl)
  try { assert.equal((await secondDb.content.findUnique({ where: { id: created.body.item.id } })).titleEn, 'English title') }
  finally { await secondDb.$disconnect() }
})
test('production cookie is secure and malformed requests return JSON', async () => {
  const productionApp = await createApp({ db, origin: 'https://onip.example', production: true })
  const response = await request(productionApp).post('/api/admin/login').set('Origin', 'https://onip.example').send({ email, password }).expect(200)
  assert.match(response.headers['set-cookie'][0], /^__Host-onip_session=/)
  assert.match(response.headers['set-cookie'][0], /; Secure/)
  await request(app).post('/api/admin/login').set('Content-Type', 'application/json').send('{').expect(400).expect('Content-Type', /json/)
  await request(app).get('/api/unknown').expect(404).expect('Content-Type', /json/)
})

test('media upload requires authentication, CSRF and a real supported file', async () => {
  const image = await sharp({ create: { width: 24, height: 16, channels: 3, background: '#0085ca' } }).png().toBuffer()
  await request(app).post('/api/admin/media').set('Content-Type', 'image/png').send(image).expect(401)
  const auth = await login()
  await request(app).post('/api/admin/media').set('Cookie', auth.cookie).set('Origin', origin).set('Content-Type', 'image/png').send(image).expect(403)
  await mutate(auth, 'post', '/api/admin/media').set('Content-Type', 'image/png').send(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>')).expect(400)
  await mutate(auth, 'post', '/api/admin/media').set('Content-Type', 'application/pdf').send(Buffer.from('not-a-pdf')).expect(400)
  await mutate(auth, 'post', '/api/admin/media').set('Content-Type', 'image/png').send(Buffer.alloc(12 * 1024 * 1024 + 1)).expect(413)
  assert.equal(await db.media.count(), 0)
})
test('photos are optimized and remain private until publication; referenced media cannot be deleted', async () => {
  const auth = await login()
  const image = await sharp({ create: { width: 24, height: 16, channels: 3, background: '#0085ca' } }).png().toBuffer()
  const upload = await mutate(auth, 'post', '/api/admin/media').set('Content-Type', 'image/png').set('X-File-Name', encodeURIComponent('photo ONIP.png')).send(image).expect(201)
  const media = upload.body.media
  assert.equal(media.mimeType, 'image/webp')
  assert.equal(media.name, 'photo ONIP.png')
  await request(app).get(media.url).expect(404)
  await request(app).get(media.url).set('Cookie', auth.cookie).expect(200).expect('Content-Type', /image\/webp/)
  const listed = await request(app).get('/api/admin/media?kind=image').set('Cookie', auth.cookie).expect(200)
  assert.equal(listed.body.items[0].id, media.id)
  const created = await mutate(auth, 'post', '/api/admin/content').send({ ...draft('carousel'), resourceUrl: media.url, position: 2 }).expect(201)
  await mutate(auth, 'delete', `/api/admin/media/${media.id}`).expect(409)
  const published = await mutate(auth, 'put', `/api/admin/content/${created.body.item.id}`).send({ ...created.body.item, status: 'published' }).expect(200)
  await request(app).get(media.url).expect(200)
  await mutate(auth, 'put', `/api/admin/content/${created.body.item.id}`).send({ ...published.body.item, status: 'draft' }).expect(200)
  await request(app).get(media.url).expect(404)
  await mutate(auth, 'delete', `/api/admin/content/${created.body.item.id}`).send({ version: 3 }).expect(200)
  await mutate(auth, 'delete', `/api/admin/media/${media.id}`).expect(200)
  await request(app).get(media.url).set('Cookie', auth.cookie).expect(404)
})
test('PDF documents can be uploaded and downloaded, but cannot be selected as carousel images', async () => {
  const auth = await login()
  const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n')
  const uploaded = await mutate(auth, 'post', '/api/admin/media').set('Content-Type', 'application/pdf').set('X-File-Name', 'notice.pdf').send(pdf).expect(201)
  const resourceUrl = uploaded.body.media.url
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft('carousel'), resourceUrl }).expect(400)
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft('documents'), resourceUrl, status: 'published' }).expect(201)
  await request(app).get(resourceUrl).expect(200).expect('Content-Type', /application\/pdf/).expect('Content-Disposition', /attachment/)
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft('documents'), resourceUrl: '/api/media/00000000-0000-4000-8000-000000000000' }).expect(400)
})
test('carousel uses configured positions and exposes only published slides', async () => {
  const auth = await login()
  const later = await mutate(auth, 'post', '/api/admin/content').send({ ...draft('carousel'), position: 8, status: 'published', resourceUrl: '/images/hero.png' }).expect(201)
  const first = await mutate(auth, 'post', '/api/admin/content').send({ ...draft('carousel'), position: 2, status: 'published', resourceUrl: '/images/center.png' }).expect(201)
  await mutate(auth, 'post', '/api/admin/content').send({ ...draft('carousel'), position: 1 }).expect(201)
  let response = await request(app).get('/api/content?type=carousel').expect(200)
  assert.deepEqual(response.body.items.map(item => item.id), [first.body.item.id, later.body.item.id])
  await mutate(auth, 'put', `/api/admin/content/${later.body.item.id}`).send({ ...later.body.item, position: 1 }).expect(200)
  response = await request(app).get('/api/content?type=carousel').expect(200)
  assert.equal(response.body.items[0].id, later.body.item.id)
})
test('public contacts support bilingual values, removal, validation and conflict protection', async () => {
  await request(app).get('/api/admin/contacts').expect(401)
  const auth = await login()
  const empty = (await request(app).get('/api/admin/contacts').set('Cookie', auth.cookie).expect(200)).body.contact
  assert.equal(empty.version, 0)
  const contact = { ...empty, email: 'contact@example.org', phone: '+243 123 456 789', address: { fr: 'Adresse de test', en: 'Test address' }, hours: { fr: 'Lundi à vendredi', en: 'Monday to Friday' }, facebookUrl: 'https://facebook.com/onip' }
  await request(app).put('/api/admin/contacts').set('Cookie', auth.cookie).set('Origin', origin).send(contact).expect(403)
  await mutate(auth, 'put', '/api/admin/contacts').send({ ...contact, facebookUrl: 'javascript:alert(1)' }).expect(400)
  await mutate(auth, 'put', '/api/admin/contacts').send({ ...contact, address: { fr: 'Adresse', en: '' } }).expect(400)
  const saved = await mutate(auth, 'put', '/api/admin/contacts').send(contact).expect(200)
  const published = await request(app).get('/api/contacts').expect(200)
  assert.equal(published.body.contact.address.en, 'Test address')
  assert.equal(published.body.contact.email, 'contact@example.org')
  await mutate(auth, 'put', '/api/admin/contacts').send(contact).expect(409)
  await mutate(auth, 'put', '/api/admin/contacts').send({ ...empty, version: saved.body.contact.version }).expect(200)
  assert.equal((await request(app).get('/api/contacts')).body.contact.email, '')
})
