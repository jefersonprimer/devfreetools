import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise with hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a stored hash
 * @param password - Plain text password to verify
 * @param passwordHash - Stored bcrypt hash
 * @returns Promise with boolean result
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}

/**
 * Generate a secure random API key
 * @param length - Length of the API key in bytes (default: 32)
 * @returns Random API key in hex format
 */
export function generateApiKey(length: number = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}
