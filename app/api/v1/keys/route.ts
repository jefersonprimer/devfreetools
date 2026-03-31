/**
 * GET  /api/keys — List user's API keys
 * POST /api/keys — Create a new API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateApiKey } from '@/lib/crypto';

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const db = getDb();
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        key: apiKeys.key,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(apiKeys.createdAt);

    // Mask keys — only show first 8 and last 4 chars
    const maskedKeys = keys.map((k) => ({
      ...k,
      key: k.key.slice(0, 8) + '••••••••' + k.key.slice(-4),
    }));

    return NextResponse.json({ keys: maskedKeys });
  } catch (error) {
    console.error('Error listing keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Limit to 10 keys per user
    const existingKeys = await db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    if (existingKeys.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 API keys reached' },
        { status: 400 }
      );
    }

    const rawKey = generateApiKey();

    const newKey = await db
      .insert(apiKeys)
      .values({
        userId,
        key: rawKey,
        name: name.trim(),
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        message: 'API key created successfully',
        key: {
          id: newKey[0].id,
          name: newKey[0].name,
          key: rawKey, // Show full key only on creation
          isActive: newKey[0].isActive,
          createdAt: newKey[0].createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
