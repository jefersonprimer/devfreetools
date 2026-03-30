/**
 * GET /api/cnpj/[cnpj] - Consultar CNPJ
 * Valida API key, verifica rate limit, retorna dados do CNPJ
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getCacheEntry, setCacheEntry } from '@/lib/cache';
import { isRateLimited, incrementUsage, getRateLimitInfo } from '@/lib/ratelimit';
import { getDb } from '@/lib/db';
import { usageLogs } from '@/db/schema';
import { isValidCnpj, cleanCnpj, formatCnpj } from '@/lib/cnpj';
import { eq, gte } from 'drizzle-orm';

/**
 * Função auxiliar para buscar dados do CNPJ
 * Integra com API real: https://publica.cnpj.ws/
 */
async function fetchCnpjData(cnpj: string): Promise<Record<string, unknown>> {
  // 1. Validar CNPJ (rápido, primeiro estágio)
  if (!isValidCnpj(cnpj)) {
    throw new Error('Invalid CNPJ');
  }

  const cleanedCnpj = cleanCnpj(cnpj);

  try {
    // 2. Buscar dados em API real
    const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanedCnpj}`, {
      headers: {
        'User-Agent': 'PrimerAPI/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 segundos de timeout
    });

    if (!response.ok) {
      // Se CNPJ não encontrado ou erro na API
      if (response.status === 404) {
        throw new Error('CNPJ not found in records');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transformar resposta da API para nosso formato padrão
    return {
      cnpj: cleanedCnpj,
      cnpjFormatted: formatCnpj(cleanedCnpj),
      name: data.nome || data.name || 'Unknown',
      status: data.status === 'Ativa' ? 'active' : 'inactive',
      foundedAt: data.data_abertura || null,
      mainActivity: data.cnae_fiscal?.descricao || 'Unknown',
      address: {
        street: `${data.logradouro || ''} ${data.numero || ''}`.trim(),
        city: data.municipio || '',
        state: data.uf || '',
        zipCode: data.cep || '',
      },
      // Dados adicionais da API
      rawData: data,
    };
  } catch (error) {
    console.error('Error fetching CNPJ data:', error);

    // Se houver erro na API, relançar o erro
    if (error instanceof Error) {
      throw new Error(`Failed to fetch CNPJ data: ${error.message}`);
    }

    throw error;
  }
}

/**
 * GET /api/cnpj/[cnpj]
 * Consultar informações de um CNPJ
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const { cnpj } = await params;

    // 1. Verificar se é uma consulta pública (sem API key)
    const authHeader = request.headers.get('authorization');
    const isPublicRequest = !authHeader?.startsWith('Bearer ');

    let user: any = null;
    let apiKey: any = null;

    if (!isPublicRequest) {
      // Consulta autenticada - validar API key
      const authResult = await validateApiKey(request);

      if ('error' in authResult) {
        return NextResponse.json(
          { error: authResult.error },
          { status: authResult.status }
        );
      }

      user = authResult.user;
      apiKey = authResult.apiKey;

      // Verificar rate limit para usuários autenticados
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

    // 2. Verificar cache
    const cachedEntry = await getCacheEntry(cnpj);
    let cacheHit = false;
    let data: Record<string, unknown>;

    if (cachedEntry) {
      data = cachedEntry.data;
      cacheHit = true;
    } else {
      // 3. Buscar dados do CNPJ
      const cnpjData = await fetchCnpjData(cnpj);

      // 4. Salvar em cache
      await setCacheEntry(cnpj, cnpjData);

      data = cnpjData;
    }

    // 5. Para consultas autenticadas, registrar uso
    if (!isPublicRequest && user && apiKey) {
      await incrementUsage(user.id);

      const db = getDb();
      await db.insert(usageLogs).values({
        userId: user.id,
        apiKeyId: apiKey.id,
        cnpj,
        cacheHit,
      });
    }

    // 6. Preparar resposta
    let usageInfo = null;
    if (!isPublicRequest && user) {
      usageInfo = await getRateLimitInfo(user.id, user.plan);
    } else {
      // Para consultas públicas, mostrar informações limitadas
      usageInfo = {
        current: 0,
        limit: 10,
        remaining: 10,
        percentageUsed: 0,
      };
    }

    return NextResponse.json(
      {
        data,
        metadata: {
          cacheHit,
          consultedAt: new Date().toISOString(),
          usage: usageInfo,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('CNPJ lookup error:', error);

    if (error instanceof Error) {
      if (error.message === 'Invalid CNPJ') {
        return NextResponse.json(
          {
            error: 'Invalid CNPJ',
            message: 'The provided CNPJ format is invalid or checksum failed validation',
          },
          { status: 400 }
        );
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            error: 'CNPJ not found',
            message: 'This CNPJ is not registered in Brazilian records',
          },
          { status: 404 }
        );
      }

      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        return NextResponse.json(
          {
            error: 'Service unavailable',
            message: 'Unable to fetch CNPJ data at this moment. Please try again later.',
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
