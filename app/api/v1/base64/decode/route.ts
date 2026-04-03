/**
 * POST /api/v1/base64/decode - Decode Base64 to text
 */

import { NextRequest, NextResponse } from 'next/server';
import { decodeBase64, decodeBase64Url, autoDecodeBase64 } from '@/lib/base64';
import { z } from 'zod';

const decodeSchema = z.object({
  input: z.string(),
  variant: z.enum(['standard', 'base64url', 'auto']).default('auto'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = decodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: validation.error.issues.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { input, variant } = validation.data;

    // Decode based on variant
    let result;
    if (variant === 'auto') {
      result = autoDecodeBase64(input);
    } else if (variant === 'base64url') {
      result = decodeBase64Url(input);
    } else {
      result = decodeBase64(input);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Decoding failed',
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
        variant: variant === 'auto' ? (result as any).variant || 'detected' : variant,
        inputLength: input.length,
        outputLength: result.output?.length || 0,
      },
      message: 'Successfully decoded from Base64',
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
  const variant = (url.searchParams.get('variant') as 'standard' | 'base64url' | 'auto') || 'auto';

  let result;
  if (variant === 'auto') {
    result = autoDecodeBase64(input);
  } else if (variant === 'base64url') {
    result = decodeBase64Url(input);
  } else {
    result = decodeBase64(input);
  }

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Decoding failed',
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
      variant: variant === 'auto' ? (result as any).variant || 'detected' : variant,
      inputLength: input.length,
      outputLength: result.output?.length || 0,
    },
    message: 'Successfully decoded from Base64',
  });
}
