import { defineConfig } from 'prisma/config';

// Resolve the database URL — falls back to local SQLite file for development
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
});
