/**
 * Rate limiting implementation
 * Controla o número de requisições por usuário baseado no seu plano
 */

import { getDb } from './db';
import { monthlyUsage } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  basic: 5000,
  pro: 50000,
};

/**
 * Obter o uso do mês atual do usuário
 */
export async function getCurrentMonthUsage(userId: string): Promise<number> {
  const db = getDb();

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStr = monthStart.toISOString().split('T')[0];

    const result = await db
      .select()
      .from(monthlyUsage)
      .where(and(eq(monthlyUsage.userId, userId), eq(monthlyUsage.month, monthStr)))
      .limit(1);

    return result[0]?.totalRequests || 0;
  } catch (error) {
    console.error('Error getting current month usage:', error);
    return 0;
  }
}

/**
 * Incrementar o uso mensal do usuário
 */
export async function incrementUsage(userId: string): Promise<void> {
  const db = getDb();

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStr = monthStart.toISOString().split('T')[0];

    const existing = await db
      .select()
      .from(monthlyUsage)
      .where(and(eq(monthlyUsage.userId, userId), eq(monthlyUsage.month, monthStr)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(monthlyUsage)
        .set({ totalRequests: existing[0].totalRequests + 1 })
        .where(eq(monthlyUsage.id, existing[0].id));
    } else {
      await db.insert(monthlyUsage).values({
        userId,
        month: monthStr,
        totalRequests: 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
}

/**
 * Verificar se o usuário atingiu o limite de requisições
 */
export async function isRateLimited(
  userId: string,
  userPlan: string
): Promise<{ limited: boolean; current: number; limit: number }> {
  const currentUsage = await getCurrentMonthUsage(userId);
  const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

  return {
    limited: currentUsage >= limit,
    current: currentUsage,
    limit,
  };
}

/**
 * Obter informações de rate limit para o usuário
 */
export async function getRateLimitInfo(
  userId: string,
  userPlan: string
): Promise<{
  current: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
}> {
  const currentUsage = await getCurrentMonthUsage(userId);
  const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  const remaining = Math.max(0, limit - currentUsage);
  const percentageUsed = (currentUsage / limit) * 100;

  return {
    current: currentUsage,
    limit,
    remaining,
    percentageUsed: Math.round(percentageUsed * 100) / 100,
  };
}
