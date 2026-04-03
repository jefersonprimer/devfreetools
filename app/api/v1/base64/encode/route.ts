/**
 * POST /api/v1/base64/encode - Encode text to Base64
 */

import { NextRequest, NextResponse } from 'next/server';
import { encodeBase64, encodeBase64Url } from '@/lib/base64';
import { z } from 'zod';

const encodeSchema = z.object({
  input: z.string(),
  variant: z.enum(['standard', 'base64url']).default('standard'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = encodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { input, variant } = validation.data;

    // Encode based on variant
    const result = variant === 'base64url' ? encodeBase64Url(input) : encodeBase64(input);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Encoding failed',
          message: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        input: input.slice(0, 1000) + (input.length > 1000 ? '...' : ''),
        output: result.output,
        variant,
        inputLength: input.length,
        outputLength: result.output?.length || 0,
      },
      message: `Successfully encoded to ${variant} Base64`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const input = url.searchParams.get('input') || '';
  const variant = (url.searchParams.get('variant') as 'standard' | 'base64url') || 'standard';

  const result = variant === 'base64url' ? encodeBase64Url(input) : encodeBase64(input);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Encoding failed',
        message: result.error,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      input: input.slice(0, 1000) + (input.length > 1000 ? '...' : ''),
      output: result.output,
      variant,
      inputLength: input.length,
      outputLength: result.output?.length || 0,
    },
    message: `Successfully encoded to ${variant} Base64`,
  });
}
