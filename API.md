# PrimerAPI - Documentação da API

## Base URL

```
http://localhost:3000/api (desenvolvimento)
https://seu-dominio.com/api (produção)
```

## Autenticação

Todas as requisições (exceto registro e login) requerem um header `Authorization`:

```
Authorization: Bearer YOUR_API_KEY
```

---

## Endpoints

### 1. Registro de Usuário

**POST** `/auth`

Criar novo usuário e obter chave de API.

#### Request

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### Response (201)

```json
{
  "message": "User created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "joao@example.com",
    "name": "João Silva",
    "plan": "free"
  },
  "apiKey": "3a7f9c2d8e4b1a6f9c2d8e4b1a6f9c2d8e4b1a6f"
}
```

#### Erros

- `400` - Email ou password inválido
- `409` - Email já registrado

---

### 2. Consultar CNPJ

**GET** `/cnpj/[cnpj]`

Obter informações de um CNPJ. A validação ocorre em 2 estágios:
1. **Validação de Formato** (rápido): Verifica 14 dígitos, checksum e dígitos repetidos
2. **Busca em Banco Real** (se passou na validação): Consulta API pública brasileira

Dados são retornados do banco de dados oficial da Receita Federal.

#### Headers

```
Authorization: Bearer YOUR_API_KEY
```

#### Request

```
GET /api/cnpj/11222333000181
```

Ou com máscara:
```
GET /api/cnpj/11.222.333/0001-81
```

#### Response (200)

```json
{
  "data": {
    "cnpj": "11222333000181",
    "cnpjFormatted": "11.222.333/0001-81",
    "name": "Company Name LTDA",
    "status": "active",
    "foundedAt": "2020-01-15",
    "mainActivity": "62.01-1-00 - Software development",
    "address": {
      "street": "Rua Exemplo, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01000-000"
    },
    "rawData": {...}
  },
  "metadata": {
    "cacheHit": false,
    "consultedAt": "2026-03-29T14:30:00.000Z",
    "usage": {
      "current": 1,
      "limit": 100,
      "remaining": 99,
      "percentageUsed": 1
    }
  }
}
```

#### Error Response (400 - CNPJ Inválido)

```json
{
  "error": "Invalid CNPJ",
  "message": "The provided CNPJ format is invalid or checksum failed validation"
}
```

#### Error Response (404 - Não Encontrado)

```json
{
  "error": "CNPJ not found",
  "message": "This CNPJ is not registered in Brazilian records"
}
```

#### Error Response (503 - Serviço Indisponível)

```json
{
  "error": "Service unavailable",
  "message": "Unable to fetch CNPJ data at this moment. Please try again later."
}
```

#### Erros Possíveis

- `400` - CNPJ inválido (formato ou checksum incorreto)
- `401` - Chave de API inválida ou ausente
- `404` - CNPJ válido mas não encontrado no banco de dados
- `429` - Rate limit excedido
- `503` - API de consulta CNPJ temporariamente indisponível

---

### 3. Obter Uso Mensal

**GET** `/usage`

Obter informações de consumo mensal e estatísticas de cache.

#### Headers

```
Authorization: Bearer YOUR_API_KEY
```

#### Response (200)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "joao@example.com",
    "name": "João Silva",
    "plan": "free"
  },
  "usage": {
    "current": 15,
    "limit": 100,
    "remaining": 85,
    "percentageUsed": 15
  },
  "cacheStats": {
    "totalRequests": 15,
    "cacheHits": 8,
    "cacheHitRate": 53.33
  },
  "period": {
    "start": "2026-03-01T00:00:00.000Z",
    "end": "2026-03-31T23:59:59.000Z"
  }
}
```

#### Erros

- `401` - Chave de API inválida ou ausente

---

## Planos e Limites

| Plano | Requisições/Mês | Preço |
|-------|-----------------|-------|
| Free | 100 | R$ 0,00 |
| Basic | 5.000 | R$ 29,90 |
| Pro | 50.000 | R$ 79,90 |

Os limites resetam todo dia 1º do mês.

---

## Rate Limiting

Quando você atinge o limite de requisições do seu plano:

1. Novas requisições retornarão status `429 Too Many Requests`
2. A resposta incluirá seu uso atual e limite
3. O limite reseta no primeiro dia do mês seguinte

Exemplo de resposta 429:

```json
{
  "error": "Rate limit exceeded",
  "message": "You have reached your monthly limit of 100 requests",
  "usage": {
    "current": 100,
    "limit": 100,
    "remaining": 0,
    "percentageUsed": 100
  }
}
```

---

## Cache

A API mantém cache automático de CNPJs consultados por 7 dias. Isso reduz custos de consultas repetidas.

No response, o campo `metadata.cacheHit` indica se o dado veio do cache:

- `true` - Dado retornado do cache (não conta contra o rate limit)
- `false` - Dado consultado em tempo real

---

## Exemplos de Uso

### cURL

```bash
# Registrar
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "joao@example.com",
    "password": "senha123"
  }'

# Consultar CNPJ
curl http://localhost:3000/api/cnpj/12345678000195 \
  -H "Authorization: Bearer YOUR_API_KEY"

# Obter uso
curl http://localhost:3000/api/usage \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### JavaScript/TypeScript

```typescript
// Registrar
const response = await fetch('http://localhost:3000/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João',
    email: 'joao@example.com',
    password: 'senha123',
  }),
});

const { apiKey } = await response.json();

// Consultar CNPJ
const cnpjResponse = await fetch('http://localhost:3000/api/cnpj/12345678000195', {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

const { data, metadata } = await cnpjResponse.json();
console.log(data);
console.log(`Cache hit: ${metadata.cacheHit}`);
console.log(`Remaining requests: ${metadata.usage.remaining}`);
```

### Python

```python
import requests

# Registrar
response = requests.post('http://localhost:3000/api/auth', json={
    'name': 'João',
    'email': 'joao@example.com',
    'password': 'senha123'
})

api_key = response.json()['apiKey']

# Consultar CNPJ
headers = {'Authorization': f'Bearer {api_key}'}
response = requests.get('http://localhost:3000/api/cnpj/12345678000195', headers=headers)
print(response.json())
```

---

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Recurso criado
- `400` - Requisição inválida
- `401` - Não autenticado
- `409` - Conflito (ex: email já existe)
- `429` - Rate limit excedido
- `500` - Erro no servidor

---

## Dúvidas?

Veja [SETUP.md](../SETUP.md) para instruções de setup.
