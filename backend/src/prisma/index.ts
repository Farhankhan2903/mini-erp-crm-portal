import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env } from '../config/env';

// Database URL — defaults to local SQLite file for development
const dbUrl = env.DATABASE_URL || 'file:./dev.db';

// Use SQLite adapter only if using local SQLite database file
const isSqlite = dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:');
const adapter = isSqlite ? new PrismaBetterSqlite3({ url: dbUrl }) : undefined;

// Singleton pattern: prevents multiple PrismaClient instances in development
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(adapter ? { adapter } : {}),
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
