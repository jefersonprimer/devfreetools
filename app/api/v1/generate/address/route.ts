import { NextRequest, NextResponse } from 'next/server';
import { generateAddressesViaCep } from '@/lib/viacep';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const countParam = parseInt(url.searchParams.get('count') || '1', 10);
    const count = Number.isNaN(countParam) ? 1 : Math.min(Math.max(countParam, 1), 50);

    const seedParam = url.searchParams.get('seed');
    const seed = seedParam === null ? undefined : Number(seedParam);
    const safeSeed = Number.isFinite(seed) ? seed : undefined;

    const uf = url.searchParams.get('uf') || undefined;
    const cidade = url.searchParams.get('cidade') || undefined;

    const addresses = await generateAddressesViaCep({
      count,
      seed: safeSeed,
      uf,
      cidade,
    });

    return NextResponse.json({
      success: true,
      countRequested: count,
      countReturned: addresses.length,
      filters: {
        uf: uf || null,
        cidade: cidade || null,
      },
      data: addresses,
      warning:
        addresses.length < count
          ? 'Could not generate all requested addresses with current filters and attempt limits.'
          : null,
    });
  } catch (error) {
    console.error('Address generation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to generate addresses from ViaCEP.',
      },
      { status: 500 }
    );
  }
}
