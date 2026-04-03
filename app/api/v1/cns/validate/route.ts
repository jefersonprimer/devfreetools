/**
 * POST /api/v1/cns/validate - Validar um ou vários CNS localmente
 *
 * Body esperado:
 * {
 *   "cns": "123456789012345"
 * }
 * ou
 * {
 *   "cns": ["123456789012345", "987654321098765"]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseCns, formatCns } from '@/lib/cns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || body.cns === undefined) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          message: 'Body must have a "cns" field (string or array of strings).',
        },
        { status: 400 }
      );
    }

    const input = body.cns;

    const normalizeResult = (value: string) => {
      const parsed = parseCns(value);
      return {
        cns: parsed.cns,
        cnsFormatted: formatCns(parsed.cns),
        valid: parsed.isValid,
        type: parsed.type,
        hasCpf: parsed.hasCpf,
        cpf: parsed.cpf || undefined,
        cpfFormatted: parsed.cpfFormatted || undefined,
        error: parsed.error,
      };
    };

    if (typeof input === 'string') {
      const result = normalizeResult(input);
      return NextResponse.json(
        {
          valid: result.valid,
          type: result.type,
          hasCpf: result.hasCpf,
          cns: result.cns,
          cnsFormatted: result.cnsFormatted,
          cpf: result.cpf,
          cpfFormatted: result.cpfFormatted,
          error: result.error,
        },
        { status: result.valid ? 200 : 400 }
      );
    }

    if (Array.isArray(input)) {
      const results = input.map((item: unknown) =>
        typeof item === 'string'
          ? normalizeResult(item)
          : {
              cns: '',
              cnsFormatted: '',
              valid: false,
              type: 'desconhecido',
              hasCpf: false,
              cpf: undefined,
              cpfFormatted: undefined,
              error: 'Item must be a string.',
            }
      );

      const hasInvalid = results.some((r) => !r.valid);
      return NextResponse.json(
        {
          success: !hasInvalid,
          data: results,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: 'Invalid payload',
        message: 'Field "cns" must be a string or an array of strings.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('CNS bulk validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'CNS bulk validation failed.' },
      { status: 500 }
    );
  }
}

