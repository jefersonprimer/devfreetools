# 🚀 MVP Pronto para Teste

A estrutura completa da API foi criada conforme o MVP.md. Aqui está como começar.

## 📋 O que foi implementado

### Libs Instaladas
- ✅ **Variáveis de Ambiente** (dotenv + zod)
- ✅ **Criptografia de Senhas** (bcryptjs)
- ✅ **Migrations de Banco** (drizzle-orm + drizzle-kit)

### Estrutura de API Routes
```
app/api/
├── auth/route.ts         → POST /api/auth (registro)
├── cnpj/[cnpj]/route.ts  → GET /api/cnpj/[cnpj] (consulta)
└── usage/route.ts        → GET /api/usage (estatísticas)
```

### Libs Auxiliares
- `lib/env.ts` - Validação de variáveis de ambiente
- `lib/crypto.ts` - Hash de senhas e geração de chaves
- `lib/db.ts` - Conexão com banco de dados
- `lib/auth.ts` - Validação de API keys
- `lib/cache.ts` - Cache de CNPJs
- `lib/ratelimit.ts` - Controle de requisições

## 🏁 Quick Start

### 1. Setup do Banco de Dados

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local e adicionar:
# DATABASE_URL=postgresql://user:password@host/dbname
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

Crie um banco PostgreSQL:
- **Supabase** (recomendado para MVP - grátis)
- Railway
- Neon
- Seu PostgreSQL local

### 2. Executar Migrations

```bash
# Gerar migrations baseadas no schema
npm run db:generate

# Executar migrations no banco
npm run db:migrate
```

Isso criará automaticamente todas as tabelas!

### 3. Iniciar o servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🧪 Testando a API

### Opção 1: cURL

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Copie a apiKey retornada

# 2. Consultar CNPJ
curl http://localhost:3000/api/cnpj/12345678000195 \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"

# 3. Obter uso mensal
curl http://localhost:3000/api/usage \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

### Opção 2: Insomnia/Postman

Importe a coleção em [API.md](API.md) como referência.

### Opção 3: Script Node.js

```javascript
// test.js
const apiUrl = 'http://localhost:3000/api';

async function test() {
  // Registrar
  const registerRes = await fetch(`${apiUrl}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    }),
  });

  const { apiKey } = await registerRes.json();
  console.log('✅ User created:', apiKey);

  // Consultar CNPJ
  const cnpjRes = await fetch(`${apiUrl}/cnpj/12345678000195`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const cnpjData = await cnpjRes.json();
  console.log('✅ CNPJ data:', cnpjData.data);

  // Obter uso
  const usageRes = await fetch(`${apiUrl}/usage`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const usage = await usageRes.json();
  console.log('✅ Usage:', usage.usage);
}

test().catch(console.error);
```

```bash
node test.js
```

## 📊 Verificar Estrutura

```bash
# Listar todos os arquivos criados
ls -la app/api/
ls -la lib/
cat db/schema.ts
```

## 📚 Documentação

- [API.md](API.md) - Documentação completa da API
- [SETUP.md](SETUP.md) - Guia de setup detalhado
- [MVP.md](MVP.md) - Visão geral do projeto

## 🔍 Verificar Banco de Dados

Se estiver usando Supabase:

```bash
# Abrir Drizzle Studio (GUI para banco)
npm run db:studio
```

Ou acesse o dashboard do Supabase diretamente.

## 🚀 Próximos Passos

1. **Integrar API real de CNPJ**
   - Criar conta em [API CNPJ](https://receitaws.com.br/)
   - Integrar em `app/api/cnpj/[cnpj]/route.ts`

2. **Integrar Stripe**
   - Criar conta em [Stripe](https://stripe.com)
   - Adicionar endpoints de pagamento

3. **Dashboard do Cliente**
   - Criar `app/dashboard/page.tsx`
   - Mostrar uso, histórico, planos

4. **Landing Page**
   - Melhorar `app/page.tsx`
   - Adicionar pricing, features, CTA

## ⚠️ Troubleshooting

**Erro: "DATABASE_URL is not set"**
- Verifique que `.env.local` existe
- Verifique que DATABASE_URL está preenchido

**Erro de conexão com banco**
- Teste a URL: `psql postgresql://...`
- Verifique firewall/IP whitelist

**Migrations falhando**
- Tente rodar `npm run db:generate` primeiro
- Verifique permissões do banco de dados

## 📞 Suporte

Veja [API.md](API.md) para exemplos de requisição em várias linguagens.

---

**Status:** ✅ MVP pronto para desenvolvimento

Próximo: Integrar APIs reais e criar dashboard do cliente
