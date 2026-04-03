/**
 * GET /api/v1/cns/generate - Gerar CNS válidos para testes
 *
 * Suporta:
 * - Geração de CNS definitivo vinculado a um CPF
 * - Geração aleatória de definitivos ou provisórios
 * - Seed determinística: mesmo seed => mesmo CNS
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { isRateLimited, incrementUsage, getRateLimitInfo } from '@/lib/ratelimit';
import { generateCns } from '@/lib/cns';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const isPublicRequest = !authHeader?.startsWith('Bearer ');

    let user: any = null;
    let apiKey: any = null;

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
    const typeParam = (url.searchParams.get('type') || 'auto').toLowerCase();
    const cpfParam = url.searchParams.get('cpf') || undefined;
    const seedParam = url.searchParams.get('seed') || undefined;

    const allowedTypes = new Set(['auto', 'definitivo', 'provisorio']);
    if (!allowedTypes.has(typeParam)) {
      return NextResponse.json(
        { error: 'Invalid type. Use one of: auto, definitivo, provisorio' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    for (let i = 0; i < count; i++) {
      const perItemSeed = seedParam ? `${seedParam}:${i}` : undefined;
      const { cns, type, hasCpf, cpf, cpfFormatted } = generateCns({
        type: typeParam as any,
        cpf: cpfParam,
        seed: perItemSeed,
      });

      results.push({
        cns,
        type,
        hasCpf,
        cpf: cpf || undefined,
        cpfFormatted: cpfFormatted || undefined,
      });
    }

    if (!isPublicRequest && user && apiKey) {
      await incrementUsage(user.id);
    }

    return NextResponse.json({
      success: true,
      data: results,
      count,
      message: `Generated ${count} valid CNS${count > 1 ? 's' : ''} for testing`,
    });
  } catch (error) {
    console.error('Error generating CNS:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

