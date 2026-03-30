import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: './db/schema.ts',
  out: './db/migrations',
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },
});
