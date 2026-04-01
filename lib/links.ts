import { getDb } from './db';
import { shortLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Gera um código curto aleatório de 6 caracteres
 */
export function generateShortCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Garante que o código gerado é único no banco de dados
 */
export async function getUniqueShortCode(length = 6): Promise<string> {
  const db = getDb();
  let code = generateShortCode(length);
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const existing = await db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.code, code))
      .limit(1);

    if (existing.length === 0) {
      isUnique = true;
    } else {
      code = generateShortCode(length);
      attempts++;
    }
  }

  if (!isUnique) {
    throw new Error('Could not generate a unique short code');
  }

  return code;
}
