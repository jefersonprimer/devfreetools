/**
 * GET /api/v1/certidao-nascimento/generate - Gerar certidoes de nascimento (dados sinteticos)
 *
 * Observacao: nao ha validacao de autenticidade/registro (apenas geracao para testes).
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { isRateLimited, incrementUsage, getRateLimitInfo } from '@/lib/ratelimit';
import { generateCertidaoNascimento } from '@/lib/certidaoNascimento';

export async function GET(request: NextRequest) {
  try {
    // Consulta publica vs autenticada (para rate limit)
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
    const format = (url.searchParams.get('format') || 'text').toLowerCase();

    const allowedFormats = new Set(['text', 'json', 'compact']);
    if (!allowedFormats.has(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use one of: text, json, compact' },
        { status: 400 }
      );
    }

    const certidoes: any[] = [];
    for (let i = 0; i < count; i++) {
      const certidao = generateCertidaoNascimento();

      if (format === 'compact') {
        certidoes.push({
          numeroCertidao: certidao.numeroCertidao,
          codigoCertidao: certidao.codigoCertidao,
        });
        continue;
      }

      if (format === 'json') {
        certidoes.push({
          numeroCertidao: certidao.numeroCertidao,
          livro: certidao.livro,
          folha: certidao.folha,
          termo: certidao.termo,
          dataRegistro: certidao.dataRegistro,
          dataNascimento: certidao.dataNascimento,
          cidade: certidao.cidade,
          uf: certidao.uf,
          sexo: certidao.sexo,
          nomeRegistrado: certidao.nomeRegistrado,
          pai: certidao.pai,
          mae: certidao.mae,
          cartorio: certidao.cartorio,
          oficial: certidao.oficial,
          codigoCertidao: certidao.codigoCertidao,
          // Mantemos também o texto para facilitar o uso direto
          value: certidao.value,
          formatted: certidao.formatted,
        });
        continue;
      }

      // format === 'text' (padrão): compatível com a UI
      certidoes.push({
        numeroCertidao: certidao.numeroCertidao,
        value: certidao.value,
        formatted: certidao.formatted,
      });
    }

    // Conta uma requisicao por chamada (coerente com outros endpoints de /generate)
    if (!isPublicRequest && user && apiKey) {
      await incrementUsage(user.id);
    }

    return NextResponse.json({
      success: true,
      data: certidoes,
      count,
      message: `Generated ${count} certidao${count > 1 ? 's' : ''} de nascimento (${format}) for testing`,
    });
  } catch (error) {
    console.error('Error generating certidao de nascimento:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

