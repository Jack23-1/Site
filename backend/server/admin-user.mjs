import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { mkdirSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { readConfig } from './config.mjs'
import { createDatabase } from './db.mjs'
import { hashPassword } from './password.mjs'

const { values } = parseArgs({ options: {
  email: { type: 'string' }, name: { type: 'string', default: 'Administrateur ONIP' },
  generate: { type: 'boolean', default: false }, reset: { type: 'boolean', default: false },
} })
let db
try {
  const email = z.string().trim().toLowerCase().email().max(254).parse(values.email)
  const name = z.string().trim().min(1).max(100).parse(values.name)
  db = createDatabase(readConfig().DATABASE_URL)
  const existing = await db.adminUser.findUnique({ where: { email } })
  if (existing && !values.reset) throw new Error('Ce compte existe déjà. Utilisez --reset uniquement pour réinitialiser son mot de passe et révoquer ses sessions.')
  let password
  if (values.generate) password = randomBytes(24).toString('base64url')
  else {
    if (!process.stdin.isTTY) throw new Error('Un terminal interactif est nécessaire, ou utilisez --generate pour enregistrer un mot de passe aléatoire dans un fichier privé.')
    let muted = false
    const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback() } })
    const prompt = createInterface({ input: process.stdin, output, terminal: true })
    process.stdout.write('Mot de passe (12 caractères minimum) : ')
    muted = true
    try {
      password = await prompt.question('')
      process.stdout.write('\nConfirmer le mot de passe : ')
      const confirmation = await prompt.question('')
      process.stdout.write('\n')
      if (password !== confirmation) throw new Error('Les mots de passe ne correspondent pas.')
    } finally { prompt.close(); output.end() }
  }
  z.string().min(12).max(256).parse(password)
  const passwordHash = await hashPassword(password)
  await db.$transaction(async transaction => {
    const user = await transaction.adminUser.upsert({ where: { email }, create: { email, name, passwordHash }, update: { name, passwordHash, active: true } })
    await transaction.session.deleteMany({ where: { userId: user.id } })
  })
  if (values.generate) {
    const directory = new URL('../.local-postgres/', import.meta.url)
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    const file = new URL(`admin-access-${Date.now()}.txt`, directory)
    writeFileSync(file, `Administration ONIP (local)\nURL : http://localhost:5173/admin\nE-mail : ${email}\nMot de passe : ${password}\n\nPour modifier le mot de passe : npm run admin:create -- --email ${email} --reset\n`, { mode: 0o600, flag: 'wx' })
    console.log(`Compte prêt : ${email}. Identifiants dans ${fileURLToPath(file)}. Ce fichier est privé et exclu de Git.`)
  } else console.log(`Compte prêt : ${email}. Les anciennes sessions ont été révoquées.`)
} catch (error) {
  console.error(error instanceof z.ZodError ? 'Adresse e-mail, nom ou mot de passe invalide (12 à 256 caractères).' : error.code ? `Impossible de créer le compte (${error.code}).` : error.message)
  process.exitCode = 1
} finally { await db?.$disconnect() }
