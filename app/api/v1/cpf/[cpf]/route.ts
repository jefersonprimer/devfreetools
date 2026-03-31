/**
 * GET /api/cpf/[cpf] - Validar CPF localmente (sem consulta externa)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cleanCpf, formatCpf, parseCpf } from '@/lib/cpf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cpf: string }> }
) {
  try {
    const { cpf } = await params;
    const result = parseCpf(cpf);

    if (!result.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid CPF',
          message: result.error || 'CPF inválido.',
          data: result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data: {
          cpf: cleanCpf(cpf),
          cpfFormatted: formatCpf(cpf),
          isValid: result.isValid,
          isSmartValid: result.isSmartValid,
          message: result.isSmartValid
            ? 'CPF válido e não detectado como suspeito.'
            : 'CPF válido, mas detectado como possivelmente suspeito (heurística).',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('CPF lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'CPF validation failed.' },
      { status: 500 }
    );
  }
}
