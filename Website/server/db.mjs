import { PrismaClient } from '@prisma/client'
export function createDatabase(url) {
  return new PrismaClient({ datasources: { db: { url } } })
}
