# Setup do Projeto MVP

Este é um MVP de um sistema de API de consulta de CNPJ com autenticação, rate limiting e múltiplos planos de preço.

## 📦 Dependências Instaladas

### Variáveis de Ambiente
- **dotenv**: Carregamento de variáveis de ambiente
- **zod**: Validação de schema das variáveis de ambiente

### Criptografia
- **bcryptjs**: Hashing de senhas com bcrypt

### Database & ORM
- **drizzle-orm**: ORM moderno e type-safe para TypeScript
- **drizzle-kit**: CLI para gerar e executar migrations
- **postgres**: Driver PostgreSQL para Node.js

## 🚀 Primeiros Passos

### 1. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Preencha com seus dados (editando .env.local)
```

**Variáveis necessárias:**
- `DATABASE_URL`: String de conexão PostgreSQL
- `NEXT_PUBLIC_API_URL`: URL da aplicação

Veja [.env.example](.env.example) para todas as opções.

### 2. Criar o Banco de Dados

Se estiver usando Supabase:
1. Crie um novo projeto em [supabase.com](https://supabase.com)
2. Copie a connection string PostgreSQL
3. Cole em `DATABASE_URL` no `.env.local`

Se usar outro banco (Railway, Neon, etc), use a string de conexão deles.

### 3. Executar Migrations

```bash
# Gerar os arquivos de migration baseados no schema
npm run db:generate

# Executar as migrations no banco
npm run db:migrate
```

Isso criará automaticamente todas as tabelas definidas em `db/schema.ts`.

### 4. Iniciar o Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

## 📚 Como Usar as Libs

### Variáveis de Ambiente

```typescript
// lib/env.ts
import { env } from '@/lib/env';

const config = env(); // Retorna um objeto com todas as variáveis
console.log(config.DATABASE_URL);
```

### Criptografia de Senhas

```typescript
// lib/crypto.ts
import { hashPassword, verifyPassword, generateApiKey } from '@/lib/crypto';

// Hash uma senha
const hash = await hashPassword('minha-senha-123');

// Verificar se a senha está correta
const isValid = await verifyPassword('minha-senha-123', hash);

// Gerar API key aleatória
const apiKey = generateApiKey(); // Retorna string hexadecimal de 64 caracteres
```

### Database com Drizzle ORM

```typescript
// lib/db.ts
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDb();

// Criar usuário
await db.insert(users).values({
  name: 'João',
  email: 'joao@example.com',
  passwordHash: await hashPassword('senha123'),
  plan: 'free',
});

// Buscar usuário
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'joao@example.com'))
  .limit(1);

// Atualizar
await db
  .update(users)
  .set({ plan: 'basic' })
  .where(eq(users.id, user[0].id));

// Deletar
await db.delete(users).where(eq(users.id, user[0].id));
```

## 📊 Schema do Banco

Veja [db/schema.ts](db/schema.ts) para a definição completa das tabelas:

- **users**: Usuários da plataforma
- **api_keys**: Chaves de API dos usuários
- **monthly_usage**: Controle de uso mensal
- **cnpj_cache**: Cache de CNPJs consultados
- **usage_logs**: Histórico de consultaz
- **subscriptions**: Integração com Stripe
- **plans**: Configuração dos planos

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start

# Gerar migrations do schema
npm run db:generate

# Executar migrations
npm run db:migrate

# Abrir Drizzle Studio (GUI para banco)
npm run db:studio

# Lint
npm run lint
```

## 📝 Estrutura de Diretórios

```
primerapi/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── page.tsx        # Home page
│   └── layout.tsx      # Layout global
├── db/
│   ├── schema.ts       # Definição das tabelas
│   └── migrations/     # Arquivos de migration (auto-gerado)
├── lib/
│   ├── env.ts          # Variáveis de ambiente
│   ├── crypto.ts       # Hash de senhas e geração de API keys
│   └── db.ts           # Conexão com banco
├── components/         # Componentes React
├── drizzle.config.ts   # Configuração do Drizzle
└── .env.local          # Variáveis de ambiente (não commitar!)
```

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Variáveis de ambiente validadas com Zod
- ✅ API keys geradas com crypto seguro
- ✅ Banco de dados com chaves estrangeiras

## 🚢 Deploy

Para deploy na Vercel:

1. Push para GitHub
2. Conecte o repositório em [vercel.com](https://vercel.com)
3. Configure variáveis de ambiente em Project Settings
4. Deploy automático a cada push

## 📞 Troubleshooting

### "DATABASE_URL is not set"
- Verifique que `.env.local` existe
- Verifique a variável `DATABASE_URL` está preenchida

### "Connection refused to database"
- Verifique a URL de conexão está correta
- Banco de dados está rodando/acessível?

### Migrations falhando
- Verifique que `DATABASE_URL` tem permissão para criar tabelas
- Tente: `npm run db:generate` primeiro

## 📖 Documentação

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Next.js Docs](https://nextjs.org)
- [Zod Docs](https://zod.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
