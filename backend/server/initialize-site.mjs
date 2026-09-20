import { readConfig } from './config.mjs'
import { createDatabase } from './db.mjs'

const db = createDatabase(readConfig().DATABASE_URL)
const slides = [
  { titleFr: 'Une identité sécurisée\npour chaque Congolais', titleEn: 'A secure identity\nfor every Congolese citizen', bodyFr: 'L’ONIP construit une identité fiable, inclusive\net accessible à tous.', bodyEn: 'ONIP is building a reliable, inclusive identity system\nthat is accessible to everyone.', resourceUrl: '/images/hero.png' },
  { titleFr: 'L’identification, plus proche\nde chez vous', titleEn: 'Identification services\ncloser to home', bodyFr: 'Des services de proximité pour accompagner\nchaque citoyen dans ses démarches.', bodyEn: 'Local services to support\nevery citizen through the process.', resourceUrl: '/images/outreach.png' },
  { titleFr: 'Une identité pour tous,\nun avenir commun', titleEn: 'An identity for everyone,\na shared future', bodyFr: 'Découvrez les centres d’enrôlement\net préparez votre visite.', bodyEn: 'Discover registration centres\nand prepare for your visit.', resourceUrl: '/images/center.png' },
  { titleFr: 'Votre identité,\nnotre engagement', titleEn: 'Your identity,\nour commitment', bodyFr: 'Une identification au service de l’inclusion\net du développement.', bodyEn: 'Identification that supports inclusion\nand development.', resourceUrl: '/images/hero.png' },
]
try {
  let count = 0
  await db.$transaction(async transaction => {
    if (await transaction.content.count({ where: { type: 'carousel' } }) === 0) {
      const result = await transaction.content.createMany({ data: slides.map((slide, index) => ({ ...slide, type: 'carousel', status: 'published', position: index + 1, publishedAt: new Date() })) })
      count = result.count
    }
    await transaction.siteContact.upsert({ where: { id: 'main' }, update: {}, create: {
      id: 'main', facebookUrl: 'https://www.facebook.com/share/1Dmq3YbWfm/?mibextid=wwXIfr', xUrl: 'https://x.com/ONIP_RDC', youtubeUrl: 'https://youtube.com/@onip243?si=LI5tkGTEFnESUy6P',
    } })
  })
  console.log(`${count} diapositives initialisées. Les réseaux sociaux existants sont conservés ; les coordonnées restent à renseigner.`)
} catch (error) { console.error(`Initialisation impossible (${error.code || error.name}).`); process.exitCode = 1 }
finally { await db.$disconnect() }
