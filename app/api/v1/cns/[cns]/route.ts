/**
 * GET /api/v1/cns/[cns] - Validar CNS localmente (sem consulta externa)
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatCns, parseCns } from '@/lib/cns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cns: string }> }
) {
  try {
    const { cns } = await params;
    const result = parseCns(cns);

    if (!result.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid CNS',
          message: result.error || 'CNS inválido.',
          data: result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data: {
          cns: result.cns,
          cnsFormatted: formatCns(result.cns),
          type: result.type,
          isValid: result.isValid,
          hasCpf: result.hasCpf,
          cpf: result.cpf || undefined,
          cpfFormatted: result.cpfFormatted || undefined,
          message:
            result.type === 'definitivo'
              ? 'CNS definitivo válido (validação matemática/estrutural, não garante existência no SUS).'
              : 'CNS provisório válido (validação matemática/estrutural, não garante existência no SUS).',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('CNS validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'CNS validation failed.' },
      { status: 500 }
    );
  }
}

