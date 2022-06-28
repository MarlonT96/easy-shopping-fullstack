import { PrismaClient } from '@prisma/client'
interface CustomGlobalThis {
  __db?: PrismaClient
}

let db: PrismaClient
const global: CustomGlobalThis = {}

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
  db.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
    global.__db.$connect()
  }

  db = global.__db
}

export { db }
