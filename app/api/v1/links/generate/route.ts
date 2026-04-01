import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { getDb } from '@/lib/db';
import { shortLinks, users } from '@/db/schema';
import { getUniqueShortCode } from '@/lib/links';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const generateSchema = z.object({
  url: z.string().url('Invalid URL format'),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export async function POST(request: Request) {
  let userId: string | null = null;

  // 1. Tentar validar via API Key primeiro
  const authResult = await validateApiKey(request);

  if (!('error' in authResult)) {
    userId = authResult.user.id;
  } else {
    // 2. Se falhar API Key, tentar via Sessão (para uso no dashboard)
    userId = await getSession();
  }

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // 3. Parse do body
    const body = await request.json();
    const validated = generateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { url, expiresInDays } = validated.data;

    // 4. Gerar código único
    const code = await getUniqueShortCode();

    // 5. Calcular data de expiração se fornecida
    let expiresAt: Date | null = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // 6. Salvar no banco
    const db = getDb();
    const [link] = await db
      .insert(shortLinks)
      .values({
        userId,
        code,
        originalUrl: url,
        expiresAt,
      })
      .returning();

    // 7. Retornar resposta
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return NextResponse.json({
      success: true,
      data: {
        id: link.id,
        code: link.code,
        originalUrl: link.originalUrl,
        shortUrl: `${baseUrl}/l/${link.code}`,
        expiresAt: link.expiresAt,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating short link:', error);
    return NextResponse.json(
      { error: 'Failed to generate short link' },
      { status: 500 }
    );
  }
}
