/**
 * Database Schema usando Drizzle ORM
 * Baseado na estrutura SQL definida em database.md
 */

import {
  pgTable,
  text,
  uuid,
  boolean,
  integer,
  timestamp,
  char,
  numeric,
  unique,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash'),
    plan: text('plan', { enum: ['free', 'basic', 'pro'] })
      .notNull()
      .default('free'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
  })
);

// ============================================================================
// API KEYS TABLE
// ============================================================================
export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: text('key').unique().notNull(),
    name: text('name'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  },
  (table) => ({
    keyIdx: index('idx_api_keys_key').on(table.key),
    userIdIdx: index('idx_api_keys_user_id').on(table.userId),
  })
);

// ============================================================================
// MONTHLY USAGE TABLE
// ============================================================================
export const monthlyUsage = pgTable(
  'monthly_usage',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    month: text('month').notNull(), // YYYY-MM format
    totalRequests: integer('total_requests').notNull().default(0),
  },
  (table) => ({
    userMonthIdx: unique('unique_user_month').on(table.userId, table.month),
    userMonthIdx2: index('idx_monthly_usage_user_month').on(
      table.userId,
      table.month
    ),
  })
);

// ============================================================================
// CNPJ CACHE TABLE
// ============================================================================
export const cnpjCache = pgTable(
  'cnpj_cache',
  {
    cnpj: char('cnpj', { length: 14 }).primaryKey(),
    data: text('data').notNull(), // JSON stringified
    consultedAt: timestamp('consulted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true })
      .notNull()
      .default(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  },
  (table) => ({
    expiresAtIdx: index('idx_cnpj_cache_expires_at').on(table.expiresAt),
  })
);

// ============================================================================
// USAGE LOGS TABLE
// ============================================================================
export const usageLogs = pgTable(
  'usage_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    apiKeyId: uuid('api_key_id').references(() => apiKeys.id, {
      onDelete: 'set null',
    }),
    cnpj: char('cnpj', { length: 14 }).notNull(),
    cacheHit: boolean('cache_hit').notNull().default(false),
    consultedAt: timestamp('consulted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_usage_logs_user_id').on(table.userId),
    consultedAtIdx: index('idx_usage_logs_consulted_at').on(
      table.consultedAt
    ),
  })
);

// ============================================================================
// SUBSCRIPTIONS TABLE
// ============================================================================
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    plan: text('plan', { enum: ['free', 'basic', 'pro'] })
      .notNull()
      .default('free'),
    status: text('status', {
      enum: ['active', 'canceled', 'past_due', 'trialing'],
    })
      .notNull()
      .default('active'),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdUnique: unique('unique_subscription_user_id').on(table.userId),
  })
);

// ============================================================================
// PLANS TABLE
// ============================================================================
export const plans = pgTable('plans', {
  name: text('name').primaryKey(),
  monthlyLimit: integer('monthly_limit').notNull(),
  monthlyPrice: numeric('monthly_price', { precision: 10, scale: 2 })
    .notNull(),
});
