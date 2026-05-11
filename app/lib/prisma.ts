import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { prisma: any }

const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma+postgres')

export const prisma = globalForPrisma.prisma || (
  isAccelerate 
    ? new PrismaClient().$extends(withAccelerate())
    : new PrismaClient()
)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma