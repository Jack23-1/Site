import express from 'express'
import { fileURLToPath } from 'node:url'
import { readConfig } from './config.mjs'
import { createDatabase } from './db.mjs'
import { createApp } from './app.mjs'

let db
try {
  const config = readConfig()
  db = createDatabase(config.DATABASE_URL)
  await db.$connect()
  const app = await createApp({ db, origin: config.APP_ORIGIN, production: config.NODE_ENV === 'production', trustProxyHops: config.TRUST_PROXY_HOPS })
  if (config.NODE_ENV === 'production') {
    const dist = fileURLToPath(new URL('../dist/', import.meta.url))
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
  console.error(error.name === 'PrismaClientInitializationError' ? 'Connexion PostgreSQL impossible. Vérifiez DATABASE_URL et démarrez la base.' : error.message)
  await db?.$disconnect()
  process.exitCode = 1
}
