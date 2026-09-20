import { registerMediaRoutes, resolveMedia } from './media.mjs'
import { contactInput, contactData, contactView } from './contacts.mjs'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { hashPassword, verifyPassword } from './password.mjs'
import { contentInput, contentType, idInput, toData, toItem, versionInput } from './content.mjs'

const lifetime = 8 * 60 * 60 * 1000
const digest = value => createHash('sha256').update(value).digest('hex')
const loginInput = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(256) })
const publicQuery = z.object({ type: contentType, cursor: z.string().uuid().optional(), limit: z.coerce.number().int().min(1).max(100).default(24) })
const userView = user => ({ id: user.id, email: user.email, name: user.name })

export async function createApp({ db, origin, production = false, trustProxyHops = 0, mediaDirectory }) {
  const app = express()
  const cookieName = production ? '__Host-onip_session' : 'onip_session'
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: production, path: '/' }
  const dummyHash = await hashPassword(randomBytes(32).toString('hex'))
  app.disable('x-powered-by')
  if (trustProxyHops) app.set('trust proxy', trustProxyHops)
  app.use(helmet({ contentSecurityPolicy: { directives: {
    'img-src': ["'self'", 'data:', 'https:'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'upgrade-insecure-requests': production ? [] : null,
  } } }))
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  app.use(express.json({ limit: '128kb' }))

  const requireOrigin = (req, res, next) => {
    if (req.get('origin') !== origin) return res.status(403).json({ message: 'Origine de la requête non autorisée.' })
    next()
  }
  const sessionToken = req => {
    const token = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
    return /^[a-f0-9]{64}$/.test(token || '') ? token : null
  }
  const findSession = async req => {
    const token = sessionToken(req)
    const session = token ? await db.session.findUnique({ where: { tokenHash: digest(token) }, include: { user: true } }) : null
    return session && session.expiresAt > new Date() && session.user.active ? session : null
  }
  const authenticate = async (req, res, next) => {
    const session = await findSession(req)
    if (!session) {
      res.clearCookie(cookieName, cookieOptions)
      return res.status(401).json({ message: 'Connexion requise.' })
    }
    req.adminSession = session
    next()
  }
  const csrf = (req, res, next) => {
    const supplied = req.get('x-csrf-token') || ''
    const expected = req.adminSession.csrfToken
    if (!/^[a-f0-9]{64}$/.test(supplied) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return res.status(403).json({ message: 'Jeton de sécurité invalide. Rechargez la page.' })
    next()
  }
  const rateMessage = { message: 'Trop de tentatives. Réessayez dans quelques minutes.' }
  const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: rateMessage })
  const accountLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false,
    keyGenerator: req => digest(typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 254) : 'invalid'), message: rateMessage })

  app.get('/api/health', async (req, res) => {
    await db.$queryRaw`SELECT 1`
    res.json({ ok: true })
  })
  app.post('/api/admin/login', requireOrigin, loginLimit, accountLimit, async (req, res) => {
    const parsed = loginInput.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: 'Renseignez une adresse e-mail valide et un mot de passe.' })
    const { email, password } = parsed.data
    const user = await db.adminUser.findUnique({ where: { email } })
    const valid = await verifyPassword(password, user?.passwordHash || dummyHash)
    if (!user?.active || !valid) return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect.' })
    const token = randomBytes(32).toString('hex')
    const csrfToken = randomBytes(32).toString('hex')
    const previous = sessionToken(req)
    await db.$transaction(async transaction => {
      await transaction.session.deleteMany({ where: { OR: [{ expiresAt: { lte: new Date() } }, ...(previous ? [{ tokenHash: digest(previous) }] : [])] } })
      await transaction.session.create({ data: { userId: user.id, tokenHash: digest(token), csrfToken, expiresAt: new Date(Date.now() + lifetime) } })
    })
    res.cookie(cookieName, token, { ...cookieOptions, maxAge: lifetime })
    res.json({ user: userView(user), csrfToken })
  })
  app.use('/api/admin', authenticate)
  app.get('/api/admin/session', (req, res) => res.json({ user: userView(req.adminSession.user), csrfToken: req.adminSession.csrfToken }))
  app.use('/api/admin', (req, res, next) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? next() : requireOrigin(req, res, () => csrf(req, res, next)))
  app.post('/api/admin/logout', async (req, res) => {
    await db.session.deleteMany({ where: { id: req.adminSession.id } })
    res.clearCookie(cookieName, cookieOptions)
    res.json({ ok: true })
  })
  registerMediaRoutes(app, { db, directory: mediaDirectory, findSession })
  app.get('/api/admin/contacts', async (req, res) => res.json({ contact: contactView(await db.siteContact.findUnique({ where: { id: 'main' } })) }))
  app.put('/api/admin/contacts', async (req, res) => {
    const value = contactInput.parse(req.body)
    let row
    if (value.version === 0) {
      try { row = await db.siteContact.create({ data: { id: 'main', ...contactData(value) } }) }
      catch (error) { if (error.code === 'P2002') return res.status(409).json({ message: 'Les contacts ont été modifiés. Rechargez la page.' }); throw error }
    } else {
      row = await db.$transaction(async transaction => {
        const changed = await transaction.siteContact.updateMany({ where: { id: 'main', version: value.version }, data: { ...contactData(value), version: { increment: 1 } } })
        return changed.count ? transaction.siteContact.findUnique({ where: { id: 'main' } }) : null
      })
      if (!row) return res.status(409).json({ message: 'Les contacts ont été modifiés. Rechargez la page.' })
    }
    res.json({ contact: contactView(row) })
  })
  app.get('/api/contacts', async (req, res) => res.json({ contact: contactView(await db.siteContact.findUnique({ where: { id: 'main' } })) }))
  app.get('/api/admin/content', async (req, res) => {
    const type = contentType.parse(req.query.type)
    const rows = await db.content.findMany({ where: { type }, orderBy: type === 'carousel' ? [{ position: 'asc' }, { id: 'asc' }] : [{ updatedAt: 'desc' }, { id: 'desc' }] })
    res.json({ items: rows.map(toItem) })
  })
  app.post('/api/admin/content', async (req, res) => {
    const item = contentInput.parse(req.body)
    const mediaId = await resolveMedia(db, item)
    const row = await db.content.create({ data: { ...toData(item), mediaId, publishedAt: item.status === 'published' ? new Date() : null } })
    res.status(201).json({ item: toItem(row) })
  })
  app.put('/api/admin/content/:id', async (req, res) => {
    const id = idInput.parse(req.params.id)
    const item = contentInput.parse(req.body)
    const version = versionInput.parse(req.body.version)
    const mediaId = await resolveMedia(db, item)
    const row = await db.$transaction(async transaction => {
      const previous = await transaction.content.findUnique({ where: { id } })
      if (!previous) return null
      if (previous.type !== item.type) return 'type'
      const update = await transaction.content.updateMany({ where: { id, version }, data: {
        ...toData(item), mediaId, version: { increment: 1 },
        publishedAt: item.status === 'published' ? previous.publishedAt || new Date() : null,
      } })
      if (!update.count) return 'conflict'
      return transaction.content.findUnique({ where: { id } })
    })
    if (!row) return res.status(404).json({ message: 'Contenu introuvable.' })
    if (row === 'type') return res.status(400).json({ message: 'Le type du contenu ne peut pas être modifié.' })
    if (row === 'conflict') return res.status(409).json({ message: 'Ce contenu a été modifié dans une autre session. Rechargez la liste avant de réessayer.' })
    res.json({ item: toItem(row) })
  })
  app.delete('/api/admin/content/:id', async (req, res) => {
    const id = idInput.parse(req.params.id)
    const version = versionInput.parse(req.body?.version)
    const deleted = await db.content.deleteMany({ where: { id, version } })
    if (!deleted.count) return res.status(409).json({ message: 'Ce contenu a été modifié ou supprimé. Rechargez la liste.' })
    res.json({ ok: true })
  })
  app.get('/api/content', async (req, res) => {
    const { type, cursor, limit } = publicQuery.parse(req.query)
    const rows = await db.content.findMany({ where: { type, status: 'published' },
      orderBy: type === 'carousel' ? [{ position: 'asc' }, { id: 'asc' }] : [{ publishedAt: 'desc' }, { id: 'desc' }], take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })
    const hasMore = rows.length > limit
    const items = rows.slice(0, limit).map(toItem)
    res.json({ items, nextCursor: hasMore ? items.at(-1).id : null })
  })
  app.use('/api', (req, res) => res.status(404).json({ message: 'Route introuvable.' }))
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0]?.message || 'Données invalides.' })
    if (error.code === 'P2003') return res.status(409).json({ message: 'Le fichier choisi a été supprimé ou est encore utilisé. Rechargez la page.' })
    if (error.type === 'encoding.unsupported') return res.status(415).json({ message: 'Format de fichier non pris en charge.' })
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Contenu trop volumineux.' })
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Requête JSON invalide.' })
    if (error.status === 400) return res.status(400).json({ message: error.message })
    console.error('API error:', error.code || error.name || 'UnknownError')
    res.status(500).json({ message: 'Une erreur serveur est survenue. Réessayez plus tard.' })
  })
  return app
}
