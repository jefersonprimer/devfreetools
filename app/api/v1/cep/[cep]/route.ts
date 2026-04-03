import { NextRequest, NextResponse } from 'next/server';
import { cleanCep, isValidCepFormat, lookupViaCep } from '@/lib/viacep';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
) {
  try {
    const { cep } = await params;
    const normalizedCep = cleanCep(cep);

    if (!isValidCepFormat(normalizedCep)) {
      return NextResponse.json(
        {
          error: 'Invalid CEP',
          message: 'CEP must contain exactly 8 digits.',
        },
        { status: 400 }
      );
    }

    const found = await lookupViaCep(normalizedCep);
    if (!found) {
      return NextResponse.json(
        {
          error: 'CEP not found',
          message: 'No address was found for this CEP.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: found,
    });
  } catch (error) {
    console.error('CEP lookup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to lookup CEP.',
      },
      { status: 500 }
    );
  }
}
