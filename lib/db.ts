import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection
 */
export function getDb() {
  if (db) return db;

  const client = postgres(env().DATABASE_URL);
  db = drizzle(client);
  return db;
}

/**
 * Run migrations from the drizzle schema
 * Execute with: npx drizzle-kit migrate
 */
export async function runMigrations() {
  console.log('🔄 Database migrations will be run with: npx drizzle-kit migrate');
  console.log('📝 Create your schema in db/schema.ts');
}

export { getDb as default };
