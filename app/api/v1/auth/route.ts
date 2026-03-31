/**
 * POST /api/auth — Register or Login
 * Body: { action: "register" | "login", email, password, name? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, apiKeys } from '@/db/schema';
import { hashPassword, verifyPassword, generateApiKey } from '@/lib/crypto';
import { createSession } from '@/lib/session';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const db = getDb();

    // ─── REGISTER ──────────────────────────────────────────────
    if (action === 'register') {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(password);

      const newUser = await db
        .insert(users)
        .values({
          name: name || email.split('@')[0],
          email,
          passwordHash,
          plan: 'free',
        })
        .returning();

      if (newUser.length === 0) {
        throw new Error('Failed to create user');
      }

      // Generate default API key
      const apiKey = generateApiKey();
      await db.insert(apiKeys).values({
        userId: newUser[0].id,
        key: apiKey,
        name: 'Default',
        isActive: true,
      });

      // Set session cookie
      await createSession(newUser[0].id);

      return NextResponse.json(
        {
          message: 'User created successfully',
          user: {
            id: newUser[0].id,
            email: newUser[0].email,
            name: newUser[0].name,
            plan: newUser[0].plan,
          },
        },
        { status: 201 }
      );
    }

    // ─── LOGIN ─────────────────────────────────────────────────
    if (action === 'login') {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const user = userResult[0];

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Set session cookie
      await createSession(user.id);

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "register" or "login"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
