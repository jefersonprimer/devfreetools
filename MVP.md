Ótima estratégia, é exatamente o que eu faria. Next.js resolve tudo junto de forma elegante pra MVP.

**Por que funciona perfeitamente:**

O Next.js tem as API Routes — você escreve o backend dentro do próprio projeto Next, na pasta `/app/api/`. Então sua rota `/api/cnpj/[cnpj]` já é seu backend Node.js, servido pela mesma Vercel, sem servidor separado. Um repositório, um deploy, zero custo.

**Como ficaria a estrutura:**

```
primerapi/
├── app/
│   ├── page.tsx              → landing page
│   ├── dashboard/page.tsx    → dashboard do cliente
│   └── api/
│       ├── cnpj/[cnpj]/route.ts   → sua API principal
│       ├── auth/route.ts          → login/cadastro
│       └── usage/route.ts         → consumo do cliente
├── components/
└── lib/
    ├── cache.ts              → cache dos CNPJs consultados
    └── ratelimit.ts          → controle de uso por cliente
```

**O que a Vercel free aguenta no MVP:**

- 100GB de banda por mês
- Funções serverless com até 10 segundos de execução
- Deploy automático a cada push no GitHub
- HTTPS gratuito e domínio `.vercel.app`

Pra MVP é mais do que suficiente. Você só vai sentir o limite quando tiver volume real de requisições — e aí já tem receita pra pagar.

**Quando migrar o backend:**

Quando você começar a sentir esses sinais é hora de separar:

- Consultas demorando mais de 10 segundos (limite do serverless free)
- Precisar de WebSocket ou conexão persistente
- Banco de dados crescendo e precisando de algo mais robusto que Supabase free
- Faturando o suficiente pra justificar um servidor dedicado (Railway, Render ou VPS na DigitalOcean ~$6/mês)

**Para o banco de dados no MVP**, usa Supabase — free tier generoso, PostgreSQL completo, e tem SDK pronto pra Next.js. Guarda lá as API keys dos clientes, uso mensal e dados de assinatura.

**Stack completa do MVP sem gastar nada:**

```
Next.js + TypeScript    → frontend + backend
Vercel                  → hospedagem
Supabase                → banco de dados
Stripe                  → pagamentos (só cobra % sobre vendas)
Upstash Redis           → cache e rate limit (free tier)
```

O Stripe é importante — não tenta fazer pagamento manual. Ele tem free tier onde você só paga quando recebe (1,5% + R$0,40 por transação no Brasil). Já deixa o plano de assinatura configurado desde o início.
