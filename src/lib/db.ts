import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Main Prisma client using DATABASE_URL (pooler for Supabase)
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), create a new client each time
  prisma = createPrismaClient()
} else {
  // In development, use global to prevent multiple instances during hot reload
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

// Export as db for regular queries (uses pooler)
export const db = prisma

// For transactions on Vercel, use this helper that creates a fresh client
// with the DIRECT_URL (bypasses pooler for transaction support)
export async function withDirectClient<T>(
  callback: (client: PrismaClient) => Promise<T>
): Promise<T> {
  // In production, create a direct client
  if (process.env.NODE_ENV === 'production' && process.env.DIRECT_URL) {
    const directClient = new PrismaClient({
      log: ['error'],
      datasourceUrl: process.env.DIRECT_URL,
    })
    try {
      return await callback(directClient)
    } finally {
      await directClient.$disconnect()
    }
  }
  // In development or if no DIRECT_URL, use the regular client
  return callback(prisma)
}

export { prisma }
