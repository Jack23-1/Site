import express from 'express'
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { z } from 'zod'
import { idInput, mediaUrlPattern } from './content.mjs'

export const defaultMediaDirectory = fileURLToPath(new URL('../.local-media/', import.meta.url))
const urlFor = id => `/api/media/${id}`
const fileFor = (directory, media) => path.join(directory, `${media.id}.${media.kind === 'image' ? 'webp' : 'pdf'}`)
const view = media => ({ id: media.id, name: media.name, kind: media.kind, size: media.size, mimeType: media.mimeType, url: urlFor(media.id) })

export async function resolveMedia(db, item) {
  const match = item.resourceUrl.match(mediaUrlPattern)
  if (!match) {
    if (item.type === 'documents' && item.resourceUrl.startsWith('/images/')) throw Object.assign(new Error('Un document doit être un PDF ou un lien HTTPS.'), { status: 400 })
    return null
  }
  const media = await db.media.findUnique({ where: { id: idInput.parse(match[1]) } })
  if (!media || media.kind !== (item.type === 'documents' ? 'document' : 'image')) throw Object.assign(new Error('Choisissez un fichier existant du bon type.'), { status: 400 })
  return media.id
}

export function registerMediaRoutes(app, { db, directory = defaultMediaDirectory, findSession }) {
  directory = path.resolve(directory)
  const uploadBody = express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], limit: '12mb', inflate: false })
  app.post('/api/admin/media', uploadBody, async (req, res) => {
    if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ message: 'Choisissez une photo JPEG, PNG, WebP ou un document PDF.' })
    let name
    try { name = path.basename(decodeURIComponent(req.get('x-file-name') || 'fichier')).split('').filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127).join('').slice(0, 180) || 'fichier' }
    catch { return res.status(400).json({ message: 'Nom de fichier invalide.' }) }
    let data, kind, mimeType
    if (req.is('application/pdf')) {
      if (!/^%PDF-[12]\.\d/.test(req.body.subarray(0, 8).toString()) || !req.body.subarray(-1024).includes(Buffer.from('%%EOF'))) return res.status(400).json({ message: 'Ce fichier ne semble pas être un PDF valide.' })
      data = req.body; kind = 'document'; mimeType = 'application/pdf'
    } else {
      try {
        const image = sharp(req.body, { limitInputPixels: 40000000, failOn: 'warning' })
        const metadata = await image.metadata()
        if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) > 1) throw new Error('Unsupported image')
        data = await image.rotate().resize({ width: 3840, height: 3840, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer()
      } catch { return res.status(400).json({ message: 'Photo invalide ou trop grande. Utilisez une image JPEG, PNG ou WebP de moins de 40 mégapixels.' }) }
      kind = 'image'; mimeType = 'image/webp'
    }
    const asset = { id: randomUUID(), name, kind, mimeType, size: data.length }
    await mkdir(directory, { recursive: true, mode: 0o700 })
    await writeFile(fileFor(directory, asset), data, { mode: 0o600, flag: 'wx' })
    try { const media = await db.media.create({ data: asset }); res.status(201).json({ media: view(media) }) }
    catch (error) { await unlink(fileFor(directory, asset)); throw error }
  })
  app.get('/api/admin/media', async (req, res) => {
    const kind = z.enum(['image', 'document']).parse(req.query.kind)
    const cursor = req.query.cursor ? idInput.parse(req.query.cursor) : null
    const rows = await db.media.findMany({ where: { kind }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 25, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) })
    res.json({ items: rows.slice(0, 24).map(view), nextCursor: rows.length > 24 ? rows[23].id : null })
  })
  app.delete('/api/admin/media/:id', async (req, res) => {
    const id = idInput.parse(req.params.id)
    const media = await db.media.findUnique({ where: { id } })
    if (!media) return res.status(404).json({ message: 'Fichier introuvable.' })
    try { await db.media.delete({ where: { id } }) }
    catch (error) { if (error.code === 'P2003') return res.status(409).json({ message: 'Ce fichier est utilisé par un contenu. Remplacez-le dans ce contenu avant de le supprimer.' }); throw error }
    await unlink(fileFor(directory, media)).catch(error => { if (error.code !== 'ENOENT') console.error('Media cleanup failed:', error.code) })
    res.json({ ok: true })
  })
  app.get('/api/media/:id', async (req, res) => {
    const id = idInput.parse(req.params.id)
    const media = await db.media.findUnique({ where: { id } })
    if (!media) return res.status(404).json({ message: 'Fichier introuvable.' })
    const published = await db.content.findFirst({ where: { mediaId: id, status: 'published' }, select: { id: true } })
    if (!published && !await findSession(req)) return res.status(404).json({ message: 'Fichier introuvable.' })
    res.set('Content-Type', media.mimeType)
    res.set('Content-Security-Policy', "sandbox; default-src 'none'")
    if (media.kind === 'document') res.attachment(media.name.toLowerCase().endsWith('.pdf') ? media.name : `${media.name}.pdf`)
    res.sendFile(fileFor(directory, media), error => {
      if (error && !res.headersSent) res.status(404).json({ message: 'Fichier indisponible.' })
    })
  })
}
