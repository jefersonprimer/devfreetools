/**
 * GET /api/cpf/generate - Gerar CPFs válidos para testes
 * Valida API key, verifica rate limit, retorna CPFs gerados
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { isRateLimited, incrementUsage, getRateLimitInfo } from '@/lib/ratelimit';
import { getDb } from '@/lib/db';
import { usageLogs } from '@/db/schema';
import { generateValidCpf, formatCpf } from '@/lib/cpf';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const isPublicRequest = !authHeader?.startsWith('Bearer ');

    let user = null;
    let apiKey = null;

    if (!isPublicRequest) {
      const authResult = await validateApiKey(request);

      if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
      }

      user = authResult.user;
      apiKey = authResult.apiKey;

      const rateLimitCheck = await isRateLimited(user.id, user.plan);
      if (rateLimitCheck.limited) {
        const limitInfo = await getRateLimitInfo(user.id, user.plan);
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `You have reached your monthly limit of ${limitInfo.limit} requests`,
            usage: limitInfo,
          },
          { status: 429 }
        );
      }
    }

    const url = new URL(request.url);
    const count = Math.min(parseInt(url.searchParams.get('count') || '1', 10), 10);

    const generatedCpfs = [];
    for (let i = 0; i < count; i++) {
      const cpf = generateValidCpf();
      generatedCpfs.push({ cpf, formatted: formatCpf(cpf) });
    }

    if (!isPublicRequest && user && apiKey) {
      // Incrementa uso mensal; logs de CPF não são armazenados em detalhe ainda.
      await incrementUsage(user.id);
      const db = getDb();
      // Inserção opcional no usageLogs para compatibilidade com esquema atual
      await db.insert(usageLogs).values({
        userId: user.id,
        cnpj: generatedCpfs[0]?.cpf || '',
        consultedAt: new Date(),
        cacheHit: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: generatedCpfs,
      count,
      message: `Generated ${count} valid CPF${count > 1 ? 's' : ''} for testing`,
    });
  } catch (error) {
    console.error('Error generating CPFs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
