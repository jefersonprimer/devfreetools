/**
 * GET /api/usage - Obter uso mensal e informações de rate limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getRateLimitInfo } from '@/lib/ratelimit';
import { getDb } from '@/lib/db';
import { usageLogs } from '@/db/schema';
import { and, eq, gte } from 'drizzle-orm';

/**
 * GET /api/usage
 * Retornar uso mensal do usuário e informações de rate limit
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Validar API key
    const authResult = await validateApiKey(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // 2. Obter informações de rate limit
    const limitInfo = await getRateLimitInfo(user.id, user.plan);

    // 3. Obter logs do mês atual
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const db = getDb();
    const logs = await db
      .select()
      .from(usageLogs)
      .where(
        and(
          eq(usageLogs.userId, user.id),
          gte(usageLogs.consultedAt, monthStart)
        )
      );

    // 4. Contar cache hits
    const cacheHits = logs.filter((log) => log.cacheHit).length;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
        usage: {
          current: limitInfo.current,
          limit: limitInfo.limit,
          remaining: limitInfo.remaining,
          percentageUsed: limitInfo.percentageUsed,
        },
        cacheStats: {
          totalRequests: logs.length,
          cacheHits,
          cacheHitRate: logs.length > 0 ? (cacheHits / logs.length) * 100 : 0,
        },
        period: {
          start: monthStart.toISOString(),
          end: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Usage lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
