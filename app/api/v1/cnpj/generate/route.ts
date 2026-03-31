/**
 * GET /api/cnpj/generate - Gerar CNPJs válidos para testes
 * Valida API key, verifica rate limit, retorna CNPJs gerados
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { isRateLimited, incrementUsage, getRateLimitInfo } from '@/lib/ratelimit';
import { getDb } from '@/lib/db';
import { usageLogs } from '@/db/schema';
import { generateValidCnpj, formatCnpj } from '@/lib/cnpj';
import { eq, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar se é uma consulta pública (sem API key)
    const authHeader = request.headers.get('authorization');
    const isPublicRequest = !authHeader?.startsWith('Bearer ');

    let user: any = null;
    let apiKey: any = null;
    let userId: string = 'public';

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
      userId = user.id;

      // 2. Verificar rate limit para usuários autenticados
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
    } else {
      // Para consultas públicas, poderíamos implementar um rate limit por IP
      // Por enquanto, vamos permitir mas registrar como public
    }

    // 3. Obter parâmetros de query
    const url = new URL(request.url);
    const count = Math.min(parseInt(url.searchParams.get('count') || '1'), 10); // Máximo 10 por vez

    // 4. Gerar CNPJs válidos
    const generatedCnpjs = [];
    for (let i = 0; i < count; i++) {
      const cnpj = generateValidCnpj();
      generatedCnpjs.push({
        cnpj: cnpj,
        formatted: formatCnpj(cnpj),
      });
    }

    // 5. Registrar uso no banco se for autenticado
    if (!isPublicRequest && user && apiKey) {
      // Registrar uso mensal
      await incrementUsage(user.id);
      
      // NOTA: A tabela usageLogs atual é específica para consultas de CNPJ 
      // e exige o campo 'cnpj'. Para a feature de geração, poderíamos 
      // criar uma tabela genérica de logs no futuro ou inserir um log 
      // para cada CNPJ gerado (o que seria redundante).
      // Por enquanto, apenas incrementamos o uso mensal.
    }

    // 7. Retornar resposta
    return NextResponse.json({
      success: true,
      data: generatedCnpjs,
      count: count,
      message: `Generated ${count} valid CNPJ${count > 1 ? 's' : ''} for testing`,
    });

  } catch (error) {
    console.error('Error generating CNPJs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}