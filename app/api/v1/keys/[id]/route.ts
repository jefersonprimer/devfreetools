/**
 * PATCH  /api/keys/[id] — Update API key (name, toggle active)
 * DELETE /api/keys/[id] — Delete API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { apiKeys } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, isActive } = body;

    const db = getDb();

    // Verify key belongs to user
    const existing = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof name === 'string' && name.trim().length > 0) {
      updates.name = name.trim();
    }
    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(apiKeys)
      .set(updates)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning();

    return NextResponse.json({
      message: 'API key updated',
      key: {
        id: updated[0].id,
        name: updated[0].name,
        isActive: updated[0].isActive,
      },
    });
  } catch (error) {
    console.error('Error updating key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const db = getDb();

    const deleted = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'API key deleted' });
  } catch (error) {
    console.error('Error deleting key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
