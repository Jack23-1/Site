import { z } from 'zod'
const text = max => z.string().trim().max(max)
const bilingual = max => z.object({ fr: text(max), en: text(max) })
const socialUrl = text(2048).refine(value => {
  if (!value) return true
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password }
  catch { return false }
}, 'Le lien du réseau social doit être une URL HTTPS.')
export const contactInput = z.object({
  email: z.union([z.literal(''), z.string().trim().email().max(254)]),
  phone: text(40).regex(/^[+\d ()./-]*$/, 'Renseignez un numéro de téléphone valide.'),
  address: bilingual(1000), hours: bilingual(500),
  facebookUrl: socialUrl, xUrl: socialUrl, youtubeUrl: socialUrl,
  version: z.number().int().min(0),
}).superRefine((value, context) => {
  for (const field of ['address', 'hours']) {
    if (Boolean(value[field].fr) !== Boolean(value[field].en)) context.addIssue({ code: 'custom', path: [field], message: 'Renseignez les deux langues pour l’adresse et les horaires, ou laissez les deux champs vides.' })
  }
})
export const emptyContact = { email: '', phone: '', address: { fr: '', en: '' }, hours: { fr: '', en: '' }, facebookUrl: '', xUrl: '', youtubeUrl: '', version: 0 }
export function contactView(row) {
  if (!row) return emptyContact
  return { email: row.email, phone: row.phone, address: { fr: row.addressFr, en: row.addressEn }, hours: { fr: row.hoursFr, en: row.hoursEn }, facebookUrl: row.facebookUrl, xUrl: row.xUrl, youtubeUrl: row.youtubeUrl, version: row.version }
}
export function contactData(value) {
  return { email: value.email, phone: value.phone, addressFr: value.address.fr, addressEn: value.address.en, hoursFr: value.hours.fr, hoursEn: value.hours.en, facebookUrl: value.facebookUrl, xUrl: value.xUrl, youtubeUrl: value.youtubeUrl }
}
