/**
 * Base64 utilities with UTF-8 support and base64url variant
 * Used by DevFreeTools encoding/decoding features
 */

export interface Base64Result {
  success: boolean;
  output?: string;
  error?: string;
}

/**
 * Encode string to Base64 with proper UTF-8 handling
 */
export function encodeBase64(input: string): Base64Result {
  try {
    if (!input) {
      return { success: true, output: '' };
    }

    // UTF-8 safe encoding using TextEncoder
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join('');
    const output = btoa(binary);

    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to encode to Base64',
    };
  }
}

/**
 * Decode Base64 to string with proper UTF-8 handling
 */
export function decodeBase64(input: string): Base64Result {
  try {
    if (!input) {
      return { success: true, output: '' };
    }

    // Normalize input (remove whitespace, fix padding)
    const normalized = normalizeBase64(input);

    // Decode
    const binary = atob(normalized);

    // Convert to UTF-8 using TextDecoder
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoder = new TextDecoder('utf-8');
    const output = decoder.decode(bytes);

    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid Base64 string',
    };
  }
}

/**
 * Encode string to base64url variant (URL-safe Base64)
 * Replaces: + → -, / → _, removes padding =
 * Commonly used in JWT tokens
 */
export function encodeBase64Url(input: string): Base64Result {
  const result = encodeBase64(input);
  if (!result.success || !result.output) {
    return result;
  }

  const base64url = result.output
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return { success: true, output: base64url };
}

/**
 * Decode base64url variant to string
 */
export function decodeBase64Url(input: string): Base64Result {
  try {
    if (!input) {
      return { success: true, output: '' };
    }

    // Convert base64url to standard base64
    let normalized = input.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const padding = normalized.length % 4;
    if (padding === 2) {
      normalized += '==';
    } else if (padding === 3) {
      normalized += '=';
    }

    return decodeBase64(normalized);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid base64url string',
    };
  }
}

/**
 * Normalize Base64 input (remove whitespace, validate characters)
 */
export function normalizeBase64(input: string): string {
  return input
    .replace(/\s/g, '') // Remove whitespace
    .replace(/[^A-Za-z0-9+/=]/g, ''); // Keep only valid Base64 chars
}

/**
 * Check if string is valid Base64
 */
export function isValidBase64(input: string): boolean {
  if (!input) return true; // Empty is valid

  const normalized = normalizeBase64(input);
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;

  if (!base64Regex.test(normalized)) {
    return false;
  }

  // Check padding
  const padding = normalized.length % 4;
  if (padding === 1) {
    return false;
  }

  // Try to decode
  try {
    atob(normalized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is valid base64url
 */
export function isValidBase64Url(input: string): boolean {
  if (!input) return true;

  // base64url allows - and _ instead of + and /
  const base64urlRegex = /^[A-Za-z0-9_-]*$/;
  if (!base64urlRegex.test(input)) {
    return false;
  }

  // Try to decode
  const result = decodeBase64Url(input);
  return result.success;
}

/**
 * Auto-detect variant and decode
 * Tries standard base64 first, then base64url
 */
export function autoDecodeBase64(input: string): Base64Result {
  if (!input) {
    return { success: true, output: '' };
  }

  // Try standard base64 first
  const standardResult = decodeBase64(input);
  if (standardResult.success) {
    return { ...standardResult, variant: 'standard' as const };
  }

  // Try base64url
  const urlResult = decodeBase64Url(input);
  if (urlResult.success) {
    return { ...urlResult, variant: 'base64url' as const };
  }

  return standardResult; // Return the first error
}

/**
 * Encode file to Base64 (for browser File API)
 */
export function fileToBase64(file: File): Promise<Base64Result> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1] || result;
      resolve({ success: true, output: base64 });
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };

    reader.readAsDataURL(file);
  });
}
