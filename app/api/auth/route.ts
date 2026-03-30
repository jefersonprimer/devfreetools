/**
 * POST /api/auth/register - Criar novo usuário
 * POST /api/auth/login - Login de usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, apiKeys } from '@/db/schema';
import { hashPassword, generateApiKey } from '@/lib/crypto';
import { eq } from 'drizzle-orm';

/**
 * POST /api/auth/register
 * Criar novo usuário e gerar API key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validar entrada
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

    // Verificar se email já existe
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

    // Hash password
    const passwordHash = await hashPassword(password);

    // Criar usuário
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

    // Gerar API key
    const apiKey = generateApiKey();
    const newApiKey = await db
      .insert(apiKeys)
      .values({
        userId: newUser[0].id,
        key: apiKey,
        name: 'Default',
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
          plan: newUser[0].plan,
        },
        apiKey: newApiKey[0].key,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/login
 * Autenticar usuário e retornar API key
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action !== 'login') {
    return NextResponse.json(
      { error: 'Use POST method for login' },
      { status: 405 }
    );
  }

  // Esse é apenas para documentação - o login real usa POST
  return NextResponse.json(
    {
      message: 'Use POST method to login',
      example: {
        method: 'POST',
        endpoint: '/api/auth',
        body: {
          action: 'login',
          email: 'user@example.com',
          password: 'password123',
        },
      },
    },
    { status: 200 }
  );
}
