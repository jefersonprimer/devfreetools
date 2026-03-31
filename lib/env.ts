import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
});

export type Env = z.infer<typeof envSchema>;

let envCache: Env | null = null;

export function env(): Env {
  if (envCache) return envCache;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten();
    const errors = Object.entries(formatted.fieldErrors)
      .map(([key, messages]) => `${key}: ${messages?.join(', ')}`)
      .join('\n  ');
    throw new Error(`Missing or invalid environment variables:\n  ${errors}`);
  }

  envCache = result.data;
  return envCache;
}
