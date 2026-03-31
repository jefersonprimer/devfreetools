/**
 * GET /api/auth/me — Get current user from session
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { users, monthlyUsage, apiKeys } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  const userId = await getSession();

  if (!userId) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const db = getDb();

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Get current month usage (format must match ratelimit.ts: YYYY-MM-DD first day)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonth = monthStart.toISOString().split('T')[0];
    const usageResult = await db
      .select()
      .from(monthlyUsage)
      .where(
        sql`${monthlyUsage.userId} = ${userId} AND ${monthlyUsage.month} = ${currentMonth}`
      )
      .limit(1);

    // Count active API keys
    const keysCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.createdAt,
      },
      usage: {
        month: currentMonth,
        totalRequests: usageResult[0]?.totalRequests ?? 0,
      },
      totalKeys: Number(keysCount[0]?.count ?? 0),
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
