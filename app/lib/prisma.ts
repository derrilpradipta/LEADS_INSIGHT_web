import { PrismaClient } from '@prisma/client'

const connectionString = "postgresql://neondb_owner:npg_2rcVDjs9PKBQ@ep-wild-mouse-aoxdjpeh-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

// Inject langsung ke process.env sebelum Prisma dibuat
process.env.DATABASE_URL = connectionString

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma