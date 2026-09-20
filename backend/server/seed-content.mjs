import { readFile } from 'node:fs/promises'
import { readConfig } from './config.mjs'
import { createDatabase } from './db.mjs'
const db = createDatabase(readConfig().DATABASE_URL)
try {
  const data = JSON.parse(await readFile(new URL('../prisma/demo-content.json', import.meta.url), 'utf8'))
  const result = await db.content.createMany({ data, skipDuplicates: true })
  console.log(`${result.count} actualités de démonstration importées comme brouillons. Aucun contenu existant n’a été modifié.`)
} catch (error) { console.error(`Import impossible (${error.code || error.name}).`); process.exitCode = 1 }
finally { await db.$disconnect() }
