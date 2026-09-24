import express from 'express'
import { fileURLToPath } from 'node:url'
import { readConfig } from './config.mjs'
import { createDatabase } from './db.mjs'
import { createApp } from './app.mjs'

let db
let config
try {
  config = readConfig()
  db = createDatabase(config.DATABASE_URL)
  await db.$connect()
  const app = await createApp({ db, origin: config.APP_ORIGIN, production: config.NODE_ENV === 'production', trustProxyHops: config.TRUST_PROXY_HOPS, mediaDirectory: process.env.MEDIA_DIRECTORY })
  if (config.NODE_ENV === 'production') {
    const dist = fileURLToPath(new URL('../../frontend/dist/', import.meta.url))
    app.use(express.static(dist, { index: false }))
    app.get('/{*path}', (req, res) => res.sendFile(`${dist}index.html`))
  }
  const server = app.listen(config.PORT, config.HOST, () => console.log(`ONIP API : http://${config.HOST}:${config.PORT}`))
  server.on('error', error => { console.error(`Démarrage impossible : ${error.code}`); process.exitCode = 1; db.$disconnect() })
  const shutdown = () => {
    const timer = setTimeout(() => process.exit(1), 10000)
    timer.unref()
    server.close(async () => { await db.$disconnect(); process.exit(0) })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
} catch (error) {
  if (error.name === 'PrismaClientInitializationError') {
    const target = new URL(config.DATABASE_URL)
    console.error(`Connexion PostgreSQL impossible (${error.errorCode || 'code inconnu'}) : ${target.hostname}:${target.port || '5432'}${target.pathname}.`)
    console.error('Pour la base locale du projet, lancez npm run db:local et utilisez le port 55432 dans backend/.env. En développement, ce fichier définit la connexion ; en production, DATABASE_URL exportée reste prioritaire.')
  } else {
    console.error(error.message)
  }
  await db?.$disconnect()
  process.exitCode = 1
}
