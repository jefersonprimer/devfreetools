/**
 * API Key authentication middleware
 * Valida e extrai a API key dos headers da requisição
 */

import { getDb } from './db';
import { apiKeys, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: 'Missing or invalid authorization header',
      status: 401,
    };
  }

  const apiKey = authHeader.slice(7);
  const db = getDb();

  try {
    // Buscar a API key no banco
    const keyRecord = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, apiKey), eq(apiKeys.isActive, true)))
      .limit(1);

    if (keyRecord.length === 0) {
      return {
        error: 'Invalid or inactive API key',
        status: 401,
      };
    }

    // Buscar o usuário associado
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, keyRecord[0].userId))
      .limit(1);

    if (user.length === 0) {
      return {
        error: 'User not found',
        status: 401,
      };
    }

    // Atualizar last_used_at
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyRecord[0].id));

    return {
      user: user[0],
      apiKey: keyRecord[0],
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}
