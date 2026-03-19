import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  // Use DATABASE_URL for connection pooling (transactions mode)
  // This is the correct setup for Supabase with Prisma
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), create a new client each time to avoid connection issues
  prisma = createPrismaClient()
} else {
  // In development, use global to prevent multiple instances during hot reload
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

// Export as db for backward compatibility
export const db = prisma
export { prisma }
