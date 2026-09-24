import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const loaded = dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true })
// In local development, use the project's database rather than a stale shell export.
if ((process.env.NODE_ENV || 'development') === 'development' && loaded.parsed?.DATABASE_URL) {
  process.env.DATABASE_URL = loaded.parsed.DATABASE_URL
}

export function readConfig(env = process.env) {
  const schema = z.object({
    DATABASE_URL: z.string().url().refine(value => ['postgres:', 'postgresql:'].includes(new URL(value).protocol)),
    APP_ORIGIN: z.string().url().default('http://localhost:5173'),
    HOST: z.string().default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  })
  const result = schema.safeParse(env)
  if (!result.success) throw new Error(`Configuration manquante ou invalide : ${result.error.issues.map(issue => issue.path.join('.')).join(', ')}. Consultez .env.example.`)
  const config = result.data
  const origin = new URL(config.APP_ORIGIN)
  if (origin.origin !== config.APP_ORIGIN || !['http:', 'https:'].includes(origin.protocol)) throw new Error('APP_ORIGIN doit contenir une origine HTTP(S) sans chemin ni barre finale.')
  if (config.NODE_ENV === 'production' && origin.protocol !== 'https:') throw new Error('APP_ORIGIN doit utiliser HTTPS en production.')
  return config
}
