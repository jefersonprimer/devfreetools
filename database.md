Here is the complete SQL to create all tables (decoupled from Supabase Auth):

```sql
-- Main users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  password_hash text, -- Added for manual authentication
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  created_at timestamptz not null default now()
);

-- API keys for each user
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  key text unique not null,
  name text, -- e.g.: "production", "test", "client x"
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

-- Monthly usage control per user
create table public.monthly_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  month date not null, -- stores the first day of the month: 2024-03-01
  total_requests integer not null default 0,
  unique(user_id, month)
);

-- Cache for already consulted CNPJs
create table public.cnpj_cache (
  cnpj char(14) primary key,
  data jsonb not null,
  consulted_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

-- Usage history
create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  api_key_id uuid references public.api_keys(id) on delete set null,
  cnpj char(14) not null,
  cache_hit boolean not null default false,
  consulted_at timestamptz not null default now()
);

-- Subscriptions linked to Stripe
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  start_date timestamptz,
  end_date timestamptz,
  updated_at timestamptz not null default now()
);
```

```sql
-- Performance indices
create index on public.api_keys(key);
create index on public.api_keys(user_id);
create index on public.monthly_usage(user_id, month);
create index on public.usage_logs(user_id);
create index on public.usage_logs(consulted_at);
create index on public.cnpj_cache(expires_at);
```

```sql
-- Plan limits (configuration table)
create table public.plans (
  name text primary key,
  monthly_limit integer not null,
  monthly_price numeric(10,2) not null
);

insert into public.plans (name, monthly_limit, monthly_price) values
  ('free',  100,    0.00),
  ('basic', 5000,   29.90),
  ('pro',   50000,  79.90);
```

```sql
-- Function that increments usage and validates plan limit
create or replace function public.increment_usage(
  p_user_id uuid,
  p_api_key_id uuid,
  p_cnpj char(14),
  p_cache_hit boolean
)
returns boolean -- returns true if allowed, false if limit reached
language plpgsql
as $$
declare
  v_plan text;
  v_limit integer;
  v_usage integer;
  v_month date := date_trunc('month', now())::date;
begin
  -- get user plan and limit
  select u.plan, pl.monthly_limit
  into v_plan, v_limit
  from public.users u
  join public.plans pl on pl.name = u.plan
  where u.id = p_user_id;

  -- get current monthly usage
  select coalesce(total_requests, 0)
  into v_usage
  from public.monthly_usage
  where user_id = p_user_id and month = v_month;

  -- block if limit reached
  if v_usage >= v_limit then
    return false;
  end if;

  -- increment usage
  insert into public.monthly_usage (user_id, month, total_requests)
  values (p_user_id, v_month, 1)
  on conflict (user_id, month)
  do update set total_requests = monthly_usage.total_requests + 1;

  -- register in history
  insert into public.usage_logs (user_id, api_key_id, cnpj, cache_hit)
  values (p_user_id, p_api_key_id, p_cnpj, p_cache_hit);

  -- update last use of api key
  update public.api_keys
  set last_used_at = now()
  where id = p_api_key_id;

  return true;
end;
$$;
```

```sql
-- Row Level Security (RLS) — each user only sees their own data
-- Note: If you move away from Supabase, auth.uid() will need to be replaced by your auth context
alter table public.users enable row level security;
alter table public.api_keys enable row level security;
alter table public.monthly_usage enable row level security;
alter table public.usage_logs enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can see their own data"
  on public.users for all
  using (auth.uid() = id);

create policy "Users can see their own api keys"
  on public.api_keys for all
  using (auth.uid() = user_id);

create policy "Users can see their own usage"
  on public.monthly_usage for all
  using (auth.uid() = user_id);

create policy "Users can see their own logs"
  on public.usage_logs for all
  using (auth.uid() = user_id);

create policy "Users can see their own subscription"
  on public.subscriptions for all
  using (auth.uid() = user_id);
```

---

**Execution order:**

1. Create the `users` table first.
2. Create the dependent tables (`api_keys`, `monthly_usage`, `usage_logs`, `subscriptions`).
3. Create the indices and the `plans` table with its initial data.
4. Create the `increment_usage` function.
5. Apply RLS policies.

*The `auth.users` trigger has been removed as you requested manual control over user creation.*

In your Next.js, you call the usage function like this:

```ts
const { data } = await supabase.rpc('increment_usage', {
  p_user_id: userId,
  p_api_key_id: keyId,
  p_cnpj: cnpj,
  p_cache_hit: false
})

if (!data) {
  return Response.json({ error: 'Plan limit reached' }, { status: 429 })
}
```
