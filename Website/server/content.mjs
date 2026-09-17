import { z } from 'zod'

export const contentType = z.enum(['news', 'documents', 'gallery'])
const title = z.string().trim().min(1, 'Les deux titres sont obligatoires.').max(180)
const body = z.string().trim().max(20000)
const link = z.string().trim().max(2048).refine(value => {
  if (!value) return true
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password }
  catch { return false }
}, 'Le lien doit être une URL HTTPS valide.')
export const contentInput = z.object({
  type: contentType,
  status: z.enum(['draft', 'published']),
  title: z.object({ fr: title, en: title }),
  body: z.object({ fr: body, en: body }),
  resourceUrl: link,
}).superRefine((item, context) => {
  if (item.type !== 'news' && !item.resourceUrl) context.addIssue({ code: 'custom', path: ['resourceUrl'], message: 'Ajoutez le lien du document ou de l’image.' })
  if (item.status === 'published' && item.type === 'news' && (!item.body.fr || !item.body.en)) context.addIssue({ code: 'custom', path: ['body'], message: 'Rédigez l’article dans les deux langues avant publication.' })
})
export const versionInput = z.number().int().positive()
export const idInput = z.string().uuid()
export function toData(item) {
  return { type: item.type, status: item.status, titleFr: item.title.fr, titleEn: item.title.en, bodyFr: item.body.fr, bodyEn: item.body.en, resourceUrl: item.resourceUrl }
}
export function toItem(row) {
  return {
    id: row.id, type: row.type, status: row.status,
    title: { fr: row.titleFr, en: row.titleEn }, body: { fr: row.bodyFr, en: row.bodyEn },
    resourceUrl: row.resourceUrl, version: row.version,
    createdAt: row.createdAt, updatedAt: row.updatedAt, publishedAt: row.publishedAt,
  }
}
