/**
 * Simple cache implementation using CNPJ Cache table
 * Armazena resultados de consultas CNPJ para reutilização
 */

import { getDb } from './db';
import { cnpjCache } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';

interface CacheEntry {
  cnpj: string;
  data: Record<string, unknown>;
  expiresAt: Date;
}

/**
 * Buscar entrada em cache
 */
export async function getCacheEntry(cnpj: string): Promise<CacheEntry | null> {
  const db = getDb();

  try {
    const result = await db
      .select()
      .from(cnpjCache)
      .where(eq(cnpjCache.cnpj, cnpj))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const entry = result[0];
    const expiresAt = entry.expiresAt || new Date();

    // Verificar se não expirou
    if (expiresAt < new Date()) {
      // Deletar entrada expirada
      await db.delete(cnpjCache).where(eq(cnpjCache.cnpj, cnpj));
      return null;
    }

    return {
      cnpj: entry.cnpj,
      data: typeof entry.data === 'string' ? JSON.parse(entry.data) : entry.data,
      expiresAt,
    };
  } catch (error) {
    console.error('Error getting cache entry:', error);
    return null;
  }
}

/**
 * Salvar entrada em cache
 */
export async function setCacheEntry(
  cnpj: string,
  data: Record<string, unknown>,
  expirationDays: number = 7
): Promise<void> {
  const db = getDb();

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    await db
      .insert(cnpjCache)
      .values({
        cnpj,
        data: JSON.stringify(data),
        expiresAt,
      })
      .onConflictDoUpdate({
        target: cnpjCache.cnpj,
        set: {
          data: JSON.stringify(data),
          consultedAt: new Date(),
          expiresAt,
        },
      });
  } catch (error) {
    console.error('Error setting cache entry:', error);
  }
}

/**
 * Limpar entradas expiradas
 */
export async function cleanExpiredEntries(): Promise<void> {
  const db = getDb();

  try {
    await db
      .delete(cnpjCache)
      .where(lt(cnpjCache.expiresAt, new Date()));
  } catch (error) {
    console.error('Error cleaning expired cache entries:', error);
  }
}
